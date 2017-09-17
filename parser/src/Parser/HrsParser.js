const htmlparser = require("htmlparser2");
const htmlclean = require("htmlclean");
const toMarkdown = require('to-markdown');
const Logger = require('../logger');


function isChapterPage(fileName) {
  return (fileName[fileName.length-1] === '-');
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

function titleFromChapter(chapter) {
  let re = new RegExp(/^([0-9]+)/i);
  let r = chapter.match(re);
  let chapterNumber = parseInt(r[1]);

  if (parseInt(chapterNumber) < 11) return '1';
  if (parseInt(chapterNumber) < 21) return '2';
  if (parseInt(chapterNumber) < 26) return '3';
  if (parseInt(chapterNumber) < 36) return '4';
  if (parseInt(chapterNumber) < 46) return '5';
  if (parseInt(chapterNumber) < 76) return '6';
  if (parseInt(chapterNumber) < 91) return '7';
  if (parseInt(chapterNumber) < 101) return '8';
  if (parseInt(chapterNumber) < 121) return '9';
  if (parseInt(chapterNumber) < 141) return '10';
  if (parseInt(chapterNumber) < 171) return '11';
  if (parseInt(chapterNumber) < 201) return '12';
  if (parseInt(chapterNumber) < 231) return '13';
  if (parseInt(chapterNumber) < 261) return '14';
  if (parseInt(chapterNumber) < 281) return '15';
  if (parseInt(chapterNumber) < 286) return '16';
  if (parseInt(chapterNumber) < 296) return '17';
  if (parseInt(chapterNumber) < 321) return '18';
  if (parseInt(chapterNumber) < 346) return '19';
  if (parseInt(chapterNumber) < 371) return '20';
  if (parseInt(chapterNumber) < 401) return '21';
  if (parseInt(chapterNumber) < 414) return '22';
  if (parseInt(chapterNumber) < 428) return '23';
  if (parseInt(chapterNumber) < 431) return '23a';
  if (parseInt(chapterNumber) < 436) return '24';
  if (parseInt(chapterNumber) < 474) return '25';
  if (parseInt(chapterNumber) < 476) return '25a';
  if (parseInt(chapterNumber) < 490) return '26';
  if (parseInt(chapterNumber) < 501) return '27';
  if (parseInt(chapterNumber) < 531) return '28';
  if (parseInt(chapterNumber) < 551) return '29';
  if (parseInt(chapterNumber) < 560) return '30';
  if (parseInt(chapterNumber) < 571) return '30a';
  if (parseInt(chapterNumber) < 601) return '31';
  if (parseInt(chapterNumber) < 621) return '32';
  if (parseInt(chapterNumber) < 631) return '33';
  if (parseInt(chapterNumber) < 641) return '34';
  if (parseInt(chapterNumber) < 651) return '35';
  if (parseInt(chapterNumber) < 701) return '36';
  if (parseInt(chapterNumber) < 801) return '37';
  return '38';
}

function generatePathFromSection(section) {
  let re = new RegExp(/^([0-9a-z]+)/i);
  let r = section.match(re);
  return `/title-${titleFromChapter(r[1])}/chapter-${r[1]}/section-${section.replace('.','_').replace(':','-')}/`;
}
function replacerAsLink(match, p1, offset, string) {
  let urlVersion = `[${match}](${generatePathFromSection(p1)})`;
  return urlVersion;
}
function convertLinks(string) {
  let re = new RegExp(/HRS §([a-z0-9:\.-]+)/ig);
  let r = string.replace(re, replacerAsLink);
  return r;
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
      let section = '';
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
          section += (i===r3.length-1) ? '-' : ':';
          section += parseInt(r3[i]);
        }
      }
      section += (r2[1] && !isNaN(parseInt(r2[1]))) ? '.'+parseInt(r2[1]) : '';

      // Other metadata that we could have but right now don't need
      // chapterStart: parseInt(r[2]),
      // chapterEnd: parseInt(r[3]),
      // r[5].toLowerCase() - is the abbreviation of the document if we want to do the other types of documents like the us constitution

      // Get Type - Title, Chapter, Section
      let type = (section !== '') ? 'hrs_section': 'chapter'; // there's no files for titles

      // Create Menu Meta
      let menuMeta = {};
      if (isChapterPage(fileName)) {
        Object.assign(menuMeta, { 
          identifier: parentName,
          parent: `title${titleFromChapter(chapter)}`
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
          title: titleFromChapter(chapter),
          chapter: chapter,
          section: (section !== '') ? chapter+section : '',
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

module.exports.getDataFromFile = function (path, data, metaFromPath, megaTitles) {
  return new Promise((resolve) => {
    let name = '';    
    let menuMeta = metaFromPath.menu;

    // Parse & sanitize
    let minimalhtml = parsehtml(data);

    // Convert to markdown
    let mdString = toMarkdown(minimalhtml.content);

    // Find links to other HRS
    mdString = convertLinks(mdString);

    // sanitize title
    let titlewhitespace = htmlclean(minimalhtml.title);

    try {
      // Announce that something about the title is worth a look
      if (metaFromPath.hrs_structure.section && !megaTitles.sections.hasOwnProperty(metaFromPath.hrs_structure.section)) {
        Logger.report(`Attention! Wasn't able to find the title for section ${metaFromPath.hrs_structure.section}`);
      } else if (metaFromPath.hrs_structure.chapter && !megaTitles.chapters.hasOwnProperty(metaFromPath.hrs_structure.chapter)) {
        Logger.report(`Attention! Wasn't able to find the title for chapter ${metaFromPath.hrs_structure.chapter}`);
      }  

      // Set Title and Name
      if (metaFromPath.hrs_structure.section && megaTitles.sections[metaFromPath.hrs_structure.section]) {
        titlewhitespace = megaTitles.sections[metaFromPath.hrs_structure.section];
        name = `${metaFromPath.hrs_structure.section} ${titlewhitespace}`;
      } else if (metaFromPath.hrs_structure.chapter && megaTitles.chapters[metaFromPath.hrs_structure.chapter]) {
        titlewhitespace = megaTitles.chapters[metaFromPath.hrs_structure.chapter];
        name = `Chapter ${metaFromPath.hrs_structure.chapter} ${titlewhitespace}`;
      }
      menuMeta.hrs.name = name;
    } catch(e) {
      Logger.report(`Problem parsing ${path}.`);
    }


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
