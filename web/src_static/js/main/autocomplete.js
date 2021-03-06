(function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
})(loadAutocomplete)

function loadAutocomplete() {
  var autoCompleteTerm;
  var autoCompleteCB;
  var autoCompletePath = _hrsGlobalHelper._baseurl+'index.json';
  var xhr = new XMLHttpRequest();
  
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 400) {
      // Success!
      var data = parseAutoCompleteData(xhr.responseText, autoCompleteTerm);
      if (data.length === 0){
        document.querySelector('.autocomplete-noResults').setAttribute('style','display:block;');
      } else {
        document.querySelector('.autocomplete-noResults').removeAttribute('style');
      }
      autoCompleteCB(data);
    } else {
      // We reached our target server, but it returned an error
    }
  }
  
  new autoComplete({
    selector: 'input[name="auto"]',
    minChars: 2,
    source: function(term, response){
      try { xhr.abort(); } catch(e){}
      autoCompleteTerm = term;
      autoCompleteCB = response;
      xhr.open('GET', autoCompletePath, true);
      xhr.send();
    },
    renderItem: function (item, search) {
      var searchitem = item.title;
      search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
      return '<div class="autocomplete-suggestion" data-val="' + item.path + '">' + searchitem.replace(re, "<b>$1</b>") + '</div>';
    },
    onSelect: function (event, term, item) {
      window.location.assign(term);
    }
  });
}


function parseAutoCompleteData(source, searchTerm){
  var results = JSON.parse(source);
  if (!results.site) return [];

  var output = [];
  for(var i=0; i<results.site.length; i++){
    if (results.site[i].title && results.site[i].title.indexOf(searchTerm) !== -1) {
      output.push(results.site[i]);
    }
  }
  return output;
}