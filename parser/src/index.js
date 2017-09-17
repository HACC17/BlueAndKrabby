// Add any custom metadata that you would like to add to all files
// Be careful, if there are conflicting meta keys, data here takes priority
const addCustomMetaAllFiles = {
  // caption: 'this string is put on every page under front matter caption'
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
    .then(()=>parseFolder(sourceFileDir, 0, false))
    .then(()=>createTitlePages())
    .then(()=>{
      Logger.status("...DONE!");
      Logger.console("");
      console.timeEnd("Duration");
      Logger.console(`${totalFolders} Folders`);
      Logger.console(`${totalFilesRead} Files Parsed`);
      Logger.console(`${totalFilesWritten} Files Written`);
      Logger.console('Please check output/report.txt for any warnings.');
    }).catch((err)=>{
      Logger.console("");
      Logger.console(`Error - ${err.message}`);
      Logger.console(err);
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
      .then(data=>HrsTitleParser.getTitlesFromFile(data, path))
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
    .then(data=>HrsParser.getDataFromFile(path, data, metaFromPath, megaTitles))
    .then((fileData)=>{
      ++totalFilesRead;

      return transformData(path, {
        meta: Object.assign({}, metaFromPath, fileData.meta, metaFromCustom),
        content: fileData.content
      });
    });
}

function transformData(path, dataObj) {
  try {
    let newpath = '';
    
    // Change Path and Filename
    if (dataObj.meta.type === 'chapter') {
      newpath = Path.join(destFileDir, `title-${dataObj.meta.hrs_structure.title}`, `chapter-${dataObj.meta.hrs_structure.chapter}`, '_index.md');
    } else if (dataObj.meta.type === 'hrs_section') {
      let FILENAME = dataObj.meta.hrs_structure.section.replace(':', '-').replace('.', '_');
      newpath = Path.join(destFileDir, `title-${dataObj.meta.hrs_structure.title}`, `chapter-${dataObj.meta.hrs_structure.chapter}`, `section-${FILENAME}.md`);
    }
  
    return writeFile(newpath, "---\n" + yaml.safeDump(dataObj.meta) + "---\n" + dataObj.content);        
  } catch(e) {
    Logger.report(`Problem transforming from ${path}`);
  }
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

// --- Create Files for Title Pages  --- 

function createTitlePages() {
  let titleInfo = [
    { num:'1', title:'General Provisions' },
    { num:'2', title:'Elections'},
    { num:'3', title:'Legislature'},
    { num:'4', title:'State Organization and Administration}, Generally'},
    { num:'5', title:'State Financial Administration'},
    { num:'6', title:'County Organization and Administration'},
    { num:'7', title:'Public Officers and Employees'},
    { num:'8', title:'Public Proceedings and Records'},
    { num:'9', title:'Public Property}, Purchasing and Contracting'},
    { num:'10', title:'Public Safety and Internal Security'},
    { num:'11', title:'Agriculture and Animals'},
    { num:'12', title:'Conservation and Resources'},
    { num:'13', title:'Planning and Economic Development'},
    { num:'14', title:'Taxation'},
    { num:'15', title:'Transportation and Utilities'},
    { num:'16', title:'Intoxicating Liquor'},
    { num:'17', title:'Motor and Other Vehicles'},
    { num:'18', title:'Education'},
    { num:'19', title:'Health'},
    { num:'20', title:'Social Services'},
    { num:'21', title:'Labor and Industrial Relations'},
    { num:'22', title:'Banks and Financial Institutions'},
    { num:'23', title:'Corporations and Partnerships'},
    { num:'23a', title:'Other Business Entities'},
    { num:'24', title:'Insurance'},
    { num:'25', title:'Professions and Occupations'},
    { num:'25a', title:'General Business Provisions'},
    { num:'26', title:'Trade Regulation and Practice'},
    { num:'27', title:'Uniform Commercial Code'},
    { num:'28', title:'Property'},
    { num:'29', title:'Decedents\' Estates'},
    { num:'30', title:'Guardians and Trustees'},
    { num:'30a', title:'Uniform Probate Code'},
    { num:'31', title:'Family'},
    { num:'32', title:'Courts and Court Officers'},
    { num:'33', title:'Evidence'},
    { num:'34', title:'Pleadings and Procedure'},
    { num:'35', title:'Appeal and Error'},
    { num:'36', title:'Civil Remedies and Defenses and Special Proceedings'},
    { num:'37', title:'Hawaii Penal Code'},
    { num:'38', title:'Procedural and Supplementary Provisions'}
  ];

  let re = new RegExp(/^([0-9]+)/i);

  let allPromises = [];

  //loop thru titles
  for (let i=0; i<titleInfo.length; i++) {

    let division = '';
    let volume = '';

    let r = titleInfo[i].num.match(re);
    let titleNumOnly = parseInt(r[1]);
    
    if (titleNumOnly < 22) division = '1';
    else if (titleNumOnly < 28) division = '2';
    else if (titleNumOnly < 32) division = '3';
    else if (titleNumOnly < 37) division = '4';
    else division = '5';

    if (titleNumOnly < 6) volume = '1';
    else if (titleNumOnly < 10) volume = '2';
    else if (titleNumOnly < 13) volume = '3';
    else if (titleNumOnly < 15) volume = '4';
    else if (titleNumOnly < 19) volume = '5';
    else if (titleNumOnly < 20) volume = '6';
    else if (titleNumOnly < 22) volume = '7';
    else if (titleNumOnly < 24) volume = '8';
    else if (titleNumOnly < 25) volume = '9';
    else if (titleNumOnly < 26) volume = '10';
    else if (titleNumOnly < 27) volume = '11';
    else if (titleNumOnly < 32) volume = '12';
    else if (titleNumOnly < 37) volume = '13';
    else volume = '14';

    // Create meta
    let meta = {
      hrs_structure: {
        division: division,
        volume: volume,
        title: titleInfo[i].num,
        chapter: '',
        section: ''
      },
      type: 'title',
      menu: {
        hrs: {
          identifier: `title${titleInfo[i].num}`,
          name: `Title ${titleInfo[i].num}. ${titleInfo[i].title}`
        }
      },
      weight: (5 * (i + 1)),
      title: titleInfo[i].title,
      full_title: `Title ${titleInfo[i].num}. ${titleInfo[i].title}`
    };
    let allMeta = Object.assign({}, meta, addCustomMetaAllFiles);

    //write file
    let path = Path.join(destFileDir, `title-${titleInfo[i].num}`, '_index.md');
    allPromises.push(writeFile(path, "---\n" + yaml.safeDump(allMeta) + "---\n"));
  
  } 

  return Promise.all(allPromises).then((val)=>val);
}




// Helper Functions
function addToMegaTitles (path, data) {
  if (data) {
    for (let chapter of data.chapter) {
      if (megaTitles.chapters.hasOwnProperty(chapter.key)) {
        Logger.report(`path: ${path} | title for chapter ${chapter.key} already exists!`);
        continue;
      }
      megaTitles.chapters[chapter.key]=chapter.title;
    }
    for (let section of data.section) {
      if (megaTitles.sections.hasOwnProperty(section.key)) {
        Logger.report(`path: ${path} | title for section ${section.key} already exists!`);
        continue;
      }
      if (section.title.startsWith('to ')) {
        Logger.report(`path: ${path} | title for section ${section.key} needs manual attention (range)`);
      }
      megaTitles.sections[section.key]=section.title;
    }
  }
}