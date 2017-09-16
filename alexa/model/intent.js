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
          "name": "chapterSuffix",
          "type": "AMAZON.LITERAL"
        },
        {
          "name": "statute",
          "type": "AMAZON.NUMBER"
        },
        {
          "name": "statuteVerse",
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