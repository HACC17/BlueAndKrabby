const htmlparser = require("htmlparser2");
const htmlclean = require("htmlclean");
const Logger = require('../logger');


module.exports.getTitlesFromFile = function(data) {
  return new Promise((resolve) => {
    resolve(parsehtmlTitles(data));
  });
};


function parsehtmlTitles(inputhtml) {
  let cleanencode = htmlclean(inputhtml.replace(/\u00a0/g, " ").replace(/&#8209;/g, "-").replace(/&quot;/g,"\""));

  let htmlString = '';
  let blockType = '';
  let writeNow = false;

  let returnObj = {
    chapter:[],
    section:[]
  };

  var parser = new htmlparser.Parser({
    onopentag: function(name, attribs){
    },
    ontext: function(text){
      let trimmed = text.trim();

      // Custom Exceptions of sections
      // for 414
      if ((trimmed === 'MBCA') 
        || (trimmed === 'Disposition Table')
        || (trimmed === 'APPENDIX')
        || (trimmed === 'Appendix')
        || (trimmed === 'Note')
      ) {
          writeNow = false;
      }

      // Skip things that are typos
      if (trimmed === '842-5 and 842-6') {
        return
      }
      
      if (writeNow) {
        let re = new RegExp(/^([0-9][a-z0-9:\._-]*).? (.+)$/i);
        let match = trimmed.match(re);
        if (match) {
          returnObj[blockType].push({ key: match[1], title: match[2] });
        }
      }
      if ((trimmed.toLowerCase() === 'chapter') || (trimmed.toLowerCase() === 'section')) {
        writeNow = true;
        blockType = trimmed.toLowerCase();
      }
    },
    onclosetag: function(name){
    }
  }, {decodeEntities: true});

  parser.write(cleanencode);
  parser.end();

  return returnObj;
}