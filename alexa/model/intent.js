{
  "intents": [
    {
      "intent": "AMAZON.CancelIntent"
    },
    {
      "intent": "AMAZON.HelpIntent"
    },
    {
      "intent": "AMAZON.StopIntent"
    },
    {
      "intent": "hrsIntent",
      "slots": [
        {
          "name": "chapter",
          "type": "AMAZON.NUMBER"
        },
        {
          "name": "chapterSub",
          "type": "AMAZON.NUMBER"
        },
        {
          "name": "chapterSuffix",
          "type": "AMAZON.LITERAL"
        },
        {
          "name": "section",
          "type": "AMAZON.NUMBER"
        },
        {
          "name": "sectionVerse",
          "type": "AMAZON.NUMBER"
        }
      ]
    },
    {
      "intent": "hrsStateSymbolIntent",
      "slots": [
        {
          "name": "symbol",
          "type": "SYMBOL_TYPES"
        }
      ]
    },
    {
      "intent": "hrsAlohaSpiritIntent"
    }
  ]
}