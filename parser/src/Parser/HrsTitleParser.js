const htmlparser = require("htmlparser2");
const htmlclean = require("htmlclean");
const Logger = require('../logger');


module.exports.getTitlesFromFile = function(data, path) {
  return new Promise((resolve) => {
    resolve(parsehtmlTitles(data, path));
  });
};


function parsehtmlTitles(inputhtml, path) {
  // let cleanencode = htmlclean(inputhtml.replace(/\u00a0/g, " ").replace(/&#8209;/g, "-").replace(/&quot;/g,"\""));
  let cleanencode = htmlclean(inputhtml.replace(/&#8209;/g, "-").replace(/&quot;/g,"\""));
  let id = '';
  let titleString = '';
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
      let reTitle = new RegExp(/^\s{10}[\S]/i);
      let isMatch = text.match(reTitle);

      // Title continued to the next line

      if (writeNow && isMatch) {
        titleString += ' ' + htmlclean(text.replace(/\u00a0/g, " ")).trim();
      } else {
        writeNow = false;

        // Save the result
        if (titleString !== '' || id !== '') {
          // chapter or section
          let type = (id.indexOf('-') === -1) ? 'chapter' : 'section';
          
          // False Positives
          if (type === 'chapter' && !id.match(/^[0-9a-z]*$/i)) { 
            titleString = '';
            id = '';
            return;
          }

          // Save
          returnObj[type].push({ key: id, title: titleString });

          //reset
          titleString = '';
          id = '';
        }

      }

      // Check if line starts with what we want
      let re = new RegExp(/^([0-9][a-z0-9:\._-]*).? (.+)$/i);
      let match = htmlclean(text.replace(/\u00a0/g, " ")).trim().match(re);
      if (match) {
        writeNow = true;
        id = match[1];
        titleString = match[2];
      }

    },
    onclosetag: function(name){
    }
  }, {decodeEntities: true});

  parser.write(cleanencode);
  parser.end();

  return returnObj;
}