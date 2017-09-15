// Add any custom metadata that you would like to add to all files
const addCustomMetaAllFiles = {
  // layout: 'page'
};

const Path = require('path');
const Promise = require('bluebird');
const yaml = require('js-yaml');
const fs = Promise.promisifyAll(require('graceful-fs'));
const mkdirp = Promise.promisifyAll(require('mkdirp'));
const del = require('del');

const Util = require('./Util/Util');
const HrsTitleParser = require('./Parser/HrsTitleParser');
const HrsParser = require('./Parser/HrsParser');
const Logger = require('./logger');

const destFileDir = Path.join('.', 'output');
let sourceFileDir = '';

let totalFolders = 0;
let totalFilesRead = 0;
let totalFilesWritten = 0;

let megaTitles = {
  chapters:{},
  sections:{}
};

function main(){
  if (process.argv.length>2) {
    sourceFileDir = Path.normalize(process.argv[2]);
  } else {
    Logger.console("Missing directory to parse: npm start <path>");
    return;
  }

  del(["output/**/*"]);

  console.time("Duration");

  // Get Title first
  parseFolder(sourceFileDir, 0, true)
    .then(()=>writeFile(destFileDir+'/000000titles.json', JSON.stringify(megaTitles)))
    .then(()=>{

      parseFolder(sourceFileDir, 0, false).then(()=>{
        Logger.status("...DONE!");
        Logger.console("");
        console.timeEnd("Duration");
        Logger.console(`${totalFolders} Folders`);
        Logger.console(`${totalFilesRead} Files Parsed`);
        Logger.console(`${totalFilesWritten} Files Written`);
      }).catch((err)=>{
        Logger.console("");
        Logger.console(`Error - ${err.message}`);
      });
      
    });

 
}
main();

// --- Folder Functions --- 

function parseFolder(path, depth, forTitles) {
  if (!forTitles) { ++totalFolders; }

  return Util.readdir(path).then(files => {
    let allPromises = [];
    for (let i=0; i<files.length; i++) {
      let file = files[i];
      let fullPath = Path.join(path, file);
      allPromises.push(Util.isDirectory( fullPath )
        .then(isDir=>{
          if (isDir) {
            return parseFolder( fullPath, ++depth, forTitles );
          } else if (Util.isHTM( fullPath )) {
            return (forTitles) ? parseFileForTitle( fullPath ) : extractData( fullPath, ((depth*1000)+(i*5)) );
          }
        }));
    }

    return Promise.all(allPromises).then((val)=>val);
  });
}

// --- File Functions --- 

function parseFileForTitle(path) {
  let filepath = Util.getFilename(path);
  if (filepath[filepath.length-1] === '-') {
    Logger.status(`... Getting file titles: ${path}`);
    return Util.readfile(path)
      .then(HrsTitleParser.getTitlesFromFile)
      .then((data)=>{
        addToMegaTitles(path, data);
        return;
      });
  } else {
    return new Promise((resolve) => { resolve(null); });
  }
}

function extractData(path, weight) {
  Logger.status(`... Getting file: ${path}`);
  let metaFromPath = HrsParser.getDataFromPath(path, weight);
  let metaFromCustom = addCustomMetaAllFiles;

  return Util.readfile(path)
    .then(data=>HrsParser.getDataFromFile(data, metaFromPath, megaTitles))
    .then((fileData)=>{
      ++totalFilesRead;

      return transformData(path, {
        meta: Object.assign({}, metaFromPath, fileData.meta, metaFromCustom),
        content: fileData.content
      });
    });
}


function transformData(path, dataObj) {
  let newpath = '';
  // Change Path and Filename
  if (dataObj.meta.type === 'chapter') {
    newpath = Path.join(destFileDir, `title-${dataObj.meta.hrs_structure.title}`, `chapter-${dataObj.meta.hrs_structure.chapter}`, '_index.md');
  } else if (dataObj.meta.type === 'statute') {
    let urlstatute = dataObj.meta.hrs_structure.statute.replace(':', '-').replace('.', '_');
    newpath = Path.join(destFileDir, `title-${dataObj.meta.hrs_structure.title}`, `chapter-${dataObj.meta.hrs_structure.chapter}`, `statute-${urlstatute}.md`);
  }

  return writeFile(newpath, "---\n" + yaml.safeDump(dataObj.meta) + "---\n" + dataObj.content);    
}


// --- Write File  --- 

function writeFile(newpath, data) {

  // Create parent directory
  return mkdirp.mkdirpAsync(Path.dirname(newpath)).then(()=>{

    // Write the file
    return fs.writeFileAsync( newpath, data ).then(()=>{
      ++totalFilesWritten;
      Logger.status(`... Writing file: ${newpath}`);
    });
  });
}



// Helper Functions
function addToMegaTitles (path, data) {
  if (data) {
    for (let chapter of data.chapter) {
      if (megaTitles.chapters.hasOwnProperty(chapter.key)) {
        Logger.console(`path: ${path} | title for chapter ${chapter.key} already exists!`);
        continue;
      }
      megaTitles.chapters[chapter.key]=chapter.title;
    }
    for (let section of data.section) {
      if (megaTitles.sections.hasOwnProperty(section.key)) {
        Logger.console(`path: ${path} | title for section ${section.key} already exists!`);
        continue;
      }
      if (section.title.startsWith('to ')) {
        Logger.console(`path: ${path} | title for section ${section.key} needs manual attention (range)`);
      }
      megaTitles.sections[section.key]=section.title;
    }
  }
}