// initialize
var cb;
var xhr = new XMLHttpRequest();
xhr.open('GET', hrs_baseurl+'index.json', true);

xhr.onload = function() {
  if (xhr.status >= 200 && xhr.status < 400) {
    // Success!
    console.log(xhr);
    var data = JSON.parse(xhr.responseText);
    cb(data);
  } else {
    // We reached our target server, but it returned an error

  }
};
  
xhr.abort = function() {
  
}

xhr.onerror = function() {
  // There was a connection error of some sort
};

console.log(hrs_baseurl+'index.json');
new autoComplete({
    selector: 'input[name="auto"]',
    minChars: 2,
    source: function(term, response){
      console.log('source');
      try { xhr.abort(); } catch(e){}
      cb = response;
      console.log(cb);
      xhr.send();
    }
});

function AJAXsimple(path) {
  this.server ={};

  this.init = function() {
    if(typeof XMLHttpRequest != 'undefined'){
      this.server = new XMLHttpRequest();
      this.server.open('GET', path, true);
      console.log("XMLHttpRequest created.");
      return true;
    }
  };
  this.send = function(){
    if(this.init()){
      this.server.send();
    }
  };
}
