'use strict';
var Alexa = require('alexa-sdk');
const https = require('https');

var APP_ID = "amzn1.ask.skill.854e4554-ce98-4d49-a2a8-73105ad7bbe9";
var SKILL_NAME = "HRS-hacc17";
var START_MESSAGE = "Hawaii Revised Statutes started!";
var HELP_MESSAGE = "I can tell you a Hawaii REVISED STATUTE. Tell me the section, for example say... read section one dash one. To exit say... exit.";
var HELP_REPROMPT = "Sorry, can you say that again?";
var STOP_MESSAGE = "Aloha!";
var SERVER_DOWN = "Sorry the HRS server isn't responding right now.";

const hosturl = 'https://sammade.github.io/aloha-io';

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};


var getSingleRequest = function(that, url) {
  
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
        const msg = bodyObj.context;
        that.emit(':tellWithCard', msg, `${bodyObj.title}`, `${bodyObj.context}`);
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
      this.emit(':elicitSlot', 'chapter', speechOutput, repromptSpeech);
    } else if (!intentObj.slots.statute.value) {
      var speechOutput = 'What chapter?';
      var repromptSpeech = speechOutput;
      this.emit(':elicitSlot', 'chapter', speechOutput, repromptSpeech);
    }
    let chapter = (intentObj.slots.chapter && intentObj.slots.chapter.value) ? intentObj.slots.chapter.value : '';
    let chapterSuffix = (intentObj.slots.chapterSuffix && intentObj.slots.chapterSuffix.value) ? intentObj.slots.chapterSuffix.value : '';
    let statute = (intentObj.slots.statute && intentObj.slots.statute.value) ? intentObj.slots.statute.value : '';
    let verse = (intentObj.slots.statuteVerse && intentObj.slots.statuteVerse.value) ? intentObj.slots.statuteVerse.value : '';

    // Get Request
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
        let statuteName = `${chapter}${chapterSuffix}-${statute}`;
        statuteName += (verse) ? `.${verse}` : '';
        let statuteVerseVoice = (verse) ? `dot ${verse}` : '';
        if (bodyObj.statutes[statuteName]) {
          const msg = bodyObj.statutes[statuteName].context;
          this.emit(':tellWithCard', msg, SKILL_NAME, `HRS - ${bodyObj.statutes[statuteName].title}\n${bodyObj.statutes[statuteName].context}`);
        } else {
          this.emit(':tell', `Sorry there is no section ${chapter} ${chapterSuffix} dash ${statute} ${statuteVerseVoice}`);
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
        // This should be replaced by a true search engine
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
    const url = `${hosturl}/title-1/chapter-5/section-5-7_5/index.json`;

    return getSingleRequest(this, url);
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

