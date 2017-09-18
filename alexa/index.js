'use strict';
var Alexa = require('alexa-sdk');
const https = require('https');

var APP_ID = "amzn1.ask.skill.854e4554-ce98-4d49-a2a8-73105ad7bbe9";
var SKILL_NAME = "HRS-hacc17";
var START_MESSAGE = "Hawaii Revised Statutes started!";
var HELP_MESSAGE = "I can tell you a Hawaii REVISED STATUTE. Tell me the section, for example say... read section one dash one. To exit say... exit.";
var HELP_REPROMPT = "Sorry, can you say that again?";
var STOP_MESSAGE = "Aloha!";
var SERVER_DOWN = "Sorry, the HRS server isn't responding right now.";
var TOO_LONG_SPEAK = "Sorry, my lips are getting tired, please look up the rest of this section online at W W W dot capitol dot hawaii dot gov";
var TOO_LONG_VIEW = "... view the rest at ";

const hosturl = 'https://sammade.github.io/aloha-io';
const max_response_length = 7000; // https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

// Get a single section's page
var getSingleRequest = function(that, path) {
  let url = (path.indexOf(hosturl) === 0) ? path : hosturl+path;
  
  return https.get(url, res => {
    res.setEncoding('utf8');
    let body = '';
    res.on('data', data => {
      body += data;
    });
    res.on('error', function(e) {
      that.emit(':tell', SERVER_DOWN);
    });
    res.on('end', () => {
      let bodyObj = JSON.parse(body);
      
      if (bodyObj.context) {
        let webpageURL = path.replace('index.json', '');

        let msgVoice = bodyObj.context.replace('-', ' dash ');
        msgVoice = (msgVoice.length > max_response_length) ? msgVoice.substring(0, max_response_length)+TOO_LONG_SPEAK : msgVoice ;

        let msgCard = (bodyObj.context.length > max_response_length) ? bodyObj.context.substring(0, max_response_length)+TOO_LONG_VIEW+webpageURL : bodyObj.context;

        that.emit(':tellWithCard', msgVoice, bodyObj.title, msgCard);
      } else {
        that.emit(':tell', SERVER_DOWN);
      }
    });
  });

};



var handlers = {
  'LaunchRequest': function () {
      this.emit(':ask', `${START_MESSAGE} Ask me something`, HELP_REPROMPT);
  },
  'hrsIntent': function () {
    const url = `${hosturl}/alexa/index.json`;

    // Get Intentions
    var intentObj = this.event.request.intent;
    if (!intentObj.slots.chapter.value) {
      var speechOutput = 'What chapter?';
      var repromptSpeech = speechOutput;
      this.emit(':elicitSlot', 'chapter', speechOutput, repromptSpeech+' Again?');
    } else if (!intentObj.slots.section.value) {
      var speechOutput = 'What section?';
      var repromptSpeech = speechOutput;
      this.emit(':elicitSlot', 'section', speechOutput, repromptSpeech+' Again?');
    }

    let chapter = (intentObj.slots.chapter && intentObj.slots.chapter.value) ? intentObj.slots.chapter.value : '';
    let chapterSuffix = (intentObj.slots.chapterSuffix && intentObj.slots.chapterSuffix.value) ? intentObj.slots.chapterSuffix.value : '';
    let chapterSub = (intentObj.slots.chapterSub && intentObj.slots.chapterSub.value) ? intentObj.slots.chapterSub.value : '';
    let section = (intentObj.slots.section && intentObj.slots.section.value) ? intentObj.slots.section.value : '';
    let verse = (intentObj.slots.sectionVerse && intentObj.slots.sectionVerse.value) ? intentObj.slots.sectionVerse.value : '';

    // Not used yet
    // let title = titleFromChapter(chapter+chapterSuffix);

    // Get Request
    // Should eventually create the URL to the section without having to look it up in the main index
    return https.get(url, res => {
      res.setEncoding('utf8');
      let body = '';
      res.on('data', data => {
        body += data;
      });
      res.on('error', function(e) {
        this.emit(':tell', SERVER_DOWN);
      });
      res.on('end', () => {
        let bodyObj = JSON.parse(body);

        let sectionName = `${chapter}${chapterSuffix.toUpperCase()}`;
        sectionName += (chapterSub) ? `:${chapterSub}` : '';
        sectionName += `-${section}`;
        sectionName += (verse) ? `.${verse}` : '';

        let sectionChapterSubVoice = (chapterSub) ? `colon ${chapterSub}` : '';
        let sectionVerseVoice = (verse) ? `dot ${verse}` : '';

        if (bodyObj.sections[sectionName]) {
          return getSingleRequest(this, bodyObj.sections[sectionName].path+'index.json');
        } else {
          this.emit(':tell', `Sorry there is no section ${chapter} ${chapterSuffix} ${sectionChapterSubVoice} dash ${section} ${sectionVerseVoice}`);
        }
      });
    });
  },
  'hrsStateSymbolIntent': function () {
    const url = `${hosturl}/title-1/chapter-5/index.json`;

    var intentObj = this.event.request.intent;
    let symbol = (intentObj.slots.symbol && intentObj.slots.symbol.value) ? intentObj.slots.symbol.value : '';
    
    https.get(url, res => {
      res.setEncoding('utf8');
      let body = '';
      res.on('data', data => {
        body += data;
      });
      res.on('error', function(e) {
        this.emit(':tell', SERVER_DOWN);
      });
      res.on('end', () => {
        let bodyObj = JSON.parse(body);
        // TODO: This should be replaced by a true search engine
        // but a simple direct text compare will do for now
        if (bodyObj.children){
          for (var i=0; i<bodyObj.children.length; i++) {
            if (bodyObj.children[i].title.toLowerCase().indexOf(symbol) !== -1) {
              return getSingleRequest(this, bodyObj.children[i].path+'index.json');
            }
          }
        }
        this.emit(':tell', `Sorry, I was unable to find information about a state ${symbol}`);
      });
    });

  },
  'hrsAlohaSpiritIntent': function () {
    const path = `${hosturl}/title-1/chapter-5/section-5-7_5/index.json`;

    return getSingleRequest(this, path);
  },
  'AMAZON.HelpIntent': function () {
      var speechOutput = HELP_MESSAGE;
      var reprompt = HELP_REPROMPT;
      this.emit(':ask', speechOutput, reprompt);
  },
  'AMAZON.CancelIntent': function () {
      this.emit(':tell', STOP_MESSAGE);
  },
  'AMAZON.StopIntent': function () {
      this.emit(':tell', STOP_MESSAGE);
  }
};


// To find the title
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