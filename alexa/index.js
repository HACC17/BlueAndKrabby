'use strict';
var Alexa = require('alexa-sdk');
const https = require('https');

var APP_ID = "amzn1.ask.skill.854e4554-ce98-4d49-a2a8-73105ad7bbe9";
var SKILL_NAME = "HRS-hacc17";
var START_MESSAGE = "Hawaii Revised Statutes launched!";
var HELP_MESSAGE = "I can tell you a Hawaii REVISED STATUTE. Tell me the statute, for example say... read statute one dash one. To exit say... exit.";
var HELP_REPROMPT = "What can I help you with?";
var STOP_MESSAGE = "Aloha!";

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

var handlers = {
  'LaunchRequest': function () {
      this.emit(':tell', START_MESSAGE);
  },
  'hrsIntent': function () {
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

    const url = 'https://sammade.github.io/aloha-io/alexa/index.json';
    return https.get(url, res => {
      res.setEncoding('utf8');
      let body = '';
      res.on('data', data => {
        body += data;
      });
      res.on('error', function(e) {
        this.emit(':tell', "Sorry the HRS server isn't responding right now.");
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
          this.emit(':tell', `Sorry there is no statute ${chapter} ${chapterSuffix} dash ${statute} ${statuteVerseVoice}`);
        }
      });
    });
      
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
