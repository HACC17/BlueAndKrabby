const htmlparser = require("htmlparser2");
const htmlclean = require("htmlclean");
const toMarkdown = require('to-markdown');
const Logger = require('../logger');


function isChapterPage(fileName) {
  return (fileName[fileName.length-1] === '-');
}


// Probably better to filter by chapter but since chapters combine numbers and letters 
// it's simplier to use weight
function getTitle(volume, weight) {
  if (volume === 1){
    if (weight < 20000) return '1';
    if (weight < 34000) return '2';
    if (weight < 44000) return '3';
    if (weight < 52000) return '4';
    return '5';
  }
  if (volume === 2){
    if (weight < 28000) return '6';
    if (weight < 52000) return '7';
    if (weight < 62000) return '8';
    return '9';
  }
  if (volume === 3){
    if (weight < 33000) return '10';
    if (weight < 66000) return '11';
    return '12';
  }
  if (volume === 4){
    if (weight < 57000) return '13';
    return '14';
  }
  if (volume === 5){
    if (weight < 37000) return '15';
    if (weight < 38000) return '16';
    if (weight < 54000) return '17';
    return '18';
  }
  if (volume === 6){
    return '19';
  }
  if (volume === 7){
    if (weight < 58000) return '20';
    return '21';
  }
  if (volume === 8){
    if (weight < 24000) return '22';
    if (weight < 50000) return '23';
    return '23a';
  }
  if (volume === 9){
    return '24';
  }
  if (volume === 10){
    if (weight < 99000) return '25';
    return '25a';
  }
  if (volume === 11){
    if (weight < 76000) return '26';
    return '27';
  }
  if (volume === 12){
    if (weight < 54000) return '28';
    if (weight < 65000) return '29';
    if (weight < 84000) return '30';
    if (weight < 85000) return '30a';
    return '31';
  }
  if (volume === 13){
    if (weight < 28000) return '32';
    if (weight < 36000) return '33';
    if (weight < 47000) return '34';
    if (weight < 49000) return '35';
    return '36';
  }
  if (volume === 14){
    if (weight < 30000) return '37';
    return '38';
  }
}
function getDivision(volume) {
  if ( volume < 8) return '1';
  if ( volume < 12) return '2';
  if ( volume < 13) return '3';
  if ( volume < 14) return '4';
  return '5'
}
function getDivisionTag(volume) {
  if ( volume < 8) return ['Government'];
  if ( volume < 12) return ['Business'];
  if ( volume < 13) return ['Property', 'Family'];
  if ( volume < 14) return ['Court', 'Judicial Proceeding'];
  return ['Crime', 'Criminal Proceeding']
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
      let volumeNumber = parseInt(r[1]);
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
          parent: `title${getTitle(volumeNumber, weight)}`
        });
      } else {
        Object.assign(menuMeta, { 
          identifier: fileName,
          parent: parentName
        });
      }

      return {
        hrs_structure: {
          division: getDivision(volumeNumber),
          volume: volumeNumber.toString(),
          title: getTitle(volumeNumber, weight),
          chapter: chapter,
          statute: (statute !== '') ? chapter+statute : '',
        },
        type: type,
        tags: getDivisionTag(volumeNumber),
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
