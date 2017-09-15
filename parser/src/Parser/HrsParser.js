const htmlparser = require("htmlparser2");
const htmlclean = require("htmlclean");
const toMarkdown = require('to-markdown');
const Logger = require('../logger');


function isChapterPage(fileName) {
  return (fileName[fileName.length-1] === '-');
}

module.exports.getDataFromPath = function (path, weight) {
  try {
    let pathSplit = path.split('/');
    let fileName = pathSplit.pop().replace('.htm','');
    let parentName = pathSplit.pop();

    // Create id meta
    let splitPath = new RegExp(/Vol([0-9]+?)_Ch([0-9a-z]+?)-([0-9a-z]+?)\/([a-z0-9-]+?)\/([a-z]+?)_([0-9a-z-_]+?).htm$/i);
    let splitAlpha = new RegExp(/([0-9]+)([a-z]+)?/i);
    let r = path.match(splitPath);
    if (r) {
      let r2 = r[6].split('_');
      let r3 = r2[0].split('-');
      let statute = '';
      let chapter = '';
      if (r3[0]=='AM') { r3.shift();}
      for (let i=0; i<r3.length; i++) {
        if (i===0 && r3[i]) {
          let r4 = r3[i].match(splitAlpha);
          chapter += (r4[1]) ? parseInt(r4[1]) : '';
          chapter += (r4[2]) ? r4[2] : '';
          continue;
        }
        if (r3[i]) {
          statute += (i===r3.length-1) ? '-' : ':';
          statute += parseInt(r3[i]);
        }
      }
      statute += (r2[1] && !isNaN(parseInt(r2[1]))) ? '.'+parseInt(r2[1]) : '';

        
      // chapterStart: parseInt(r[2]),
      // chapterEnd: parseInt(r[3]),
      //r[5].toLowerCase() - is the abbreviation of the document

      // Get Type - Title, Chapter, Statute
      let type = (statute !== '') ? 'statute': 'chapter'; // there's no files for titles

      // Create Menu Meta
      let menuMeta = {};
      if (isChapterPage(fileName)) {
        Object.assign(menuMeta, { 
          identifier: parentName,
          parent: `title${parseInt(r[1])}`
        });
      } else {
        Object.assign(menuMeta, { 
          identifier: fileName,
          parent: parentName
        });
      }

      return {
        hrs_structure: {
          title: parseInt(r[1]).toString(),
          chapter: chapter,
          statute: (statute !== '') ? chapter+statute : '',
        },
        type: type,
        menu: { 
          hrs : menuMeta
        },
        weight: weight
      }
    }
  } catch(e) {
    console.log(path);
    console.log(e);
  }
  
  return {};
};

module.exports.getDataFromFile = function (data, metaFromPath, megaTitles) {
  return new Promise((resolve) => {
    let name = '';    
    let menuMeta = metaFromPath.menu;

    // Parse & sanitize
    let minimalhtml = parsehtml(data);

    // Convert to markdown
    let mdString = toMarkdown(minimalhtml.content);

    // sanitize title
    let titlewhitespace = htmlclean(minimalhtml.title);

    if (metaFromPath.hrs_structure.statute && !megaTitles.sections.hasOwnProperty(metaFromPath.hrs_structure.statute)) {
      console.log(`Attention! Wasn't able to find the title for statute ${metaFromPath.hrs_structure.statute}`);
    } else if (metaFromPath.hrs_structure.chapter && !megaTitles.chapters.hasOwnProperty(metaFromPath.hrs_structure.chapter)) {
      console.log(`Attention! Wasn't able to find the title for chapter ${metaFromPath.hrs_structure.chapter}`);
    }  
    if (metaFromPath.hrs_structure.statute && megaTitles.sections[metaFromPath.hrs_structure.statute]) {
      titlewhitespace = megaTitles.sections[metaFromPath.hrs_structure.statute];
      name = `${metaFromPath.hrs_structure.statute} ${titlewhitespace}`;
    } else if (metaFromPath.hrs_structure.chapter && megaTitles.chapters[metaFromPath.hrs_structure.chapter]) {
      titlewhitespace = megaTitles.chapters[metaFromPath.hrs_structure.chapter];
      name = `Chapter ${metaFromPath.hrs_structure.chapter} ${titlewhitespace}`;
    }
    menuMeta.hrs.name = name;

    resolve({
      meta: {
        title: titlewhitespace,
        full_title: name,
        menu: menuMeta,
      },
      content: mdString
    });
  });
};


function parsehtml(inputhtml) {
  let cleanencode = htmlclean(inputhtml.replace(/\u00a0/g, " ").replace(/&#8209;/g, "-"));

  let htmlString = '';
  let writeNow = false;

  let titleString = '';
  let titleNow = false;

  var parser = new htmlparser.Parser({
    onopentag: function(name, attribs){
      if (name === "body") {
        writeNow = true;
        return;
      }
      if ((name !== "div") && (name !== "span")) {
        htmlString += (writeNow) ? `<${name}>` : '';
        titleString += (titleNow) ? `<${name}>` : '';
      }
      // if ((name === "title") || (name === "p" && titleString === '')) {
      if ((name === "p" && titleString === '')) {
        titleNow = true;
      }
    },
    ontext: function(text){
      if (writeNow) {
        htmlString += text;
      }
      if (titleNow) {
        titleString += text;
      }
    },
    onclosetag: function(name){
      // Ensure we get enough for the title as some bold tags ended with one digit
      // if ((name === "title" || name === "p") && titleNow) {
      if (name === "p" && titleNow) {
        titleNow = false;
      }
      if (name === "body"){
        writeNow = false;
        return;
      }
      if ((name !== "div") && (name !== "span")) {
        htmlString += (writeNow) ? `</${name}>` : '';
        titleString += (titleNow) ? `</${name}>` : '';
        return;
      }
    }
  }, {decodeEntities: true});

  parser.write(cleanencode);
  parser.end();

  let re = new RegExp(/<b>(.*)<\/b>/ig);
  titleMatch = titleString.match(re);
  if (titleMatch) {
    let match = titleMatch[0];
    let position = match.indexOf('.</b>');
    match = (position !== -1) ? match.substring(0,position+1) : match;
    titleString = match.replace(/(<b>|<\/b>|<span>|<\/span>|<a>|<\/a>)/ig, '');
  }
  cleanTitle = htmlclean(titleString);

  return {title: cleanTitle, content: htmlString};
}
