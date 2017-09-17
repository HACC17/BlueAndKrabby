(function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
})(loadSidebarData)

function loadSidebarData() {
  var sidebarPath = hrs_baseurl+'sidebar/index.json';
  var xhr = new XMLHttpRequest();
  
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 400) {
      // Success!
      var data = JSON.parse(xhr.responseText).hrs_menu;
      sidebarCB(document.querySelector('.sidebar-menu'), data);
    } else {
      // We reached our target server, but it returned an error
    }
  };
  xhr.open('GET', sidebarPath, true);
  xhr.send();
}

function sidebarCB(element, submenu){

  for (var i=0; i<submenu.length; i++) {
    var li = document.createElement('li');
    Util.addClass(li, 'sidebar-item');
    if (hrs_identifier === submenu[i].URL) 
      Util.addClass(li, 'current');
    else if (hrs_identifier !== '/' && hrs_identifier.indexOf(submenu[i].URL) === 0 ) 
      Util.addClass(li, 'active');

    var anchor = document.createElement('a');
    anchor.setAttribute('href', submenu[i].URL);

    var span = document.createElement('span');
    span.innerText = submenu[i].Name;
    anchor.appendChild(span);
    li.appendChild(anchor);
    
    if (submenu[i].Children) {
      var button = document.createElement('button');
      button.setAttribute("class", "sidebar-item-button btn-flat");
      button.setAttribute("onclick", "sidebarExtendToggle(event)");
      if (hrs_identifier !== '/' && hrs_identifier.indexOf(submenu[i].URL) === 0 ) {
        button.setAttribute("aria-expanded", "true");
      } else {
        button.setAttribute("aria-expanded", "flase");
      }

      var buttonIcon = document.createElement('i');
      buttonIcon.setAttribute("aria-hidden", "true");
      buttonIcon.setAttribute("class", "fa fa-lg");
      if (hrs_identifier !== '/' && hrs_identifier.indexOf(submenu[i].URL) === 0 ) {
        Util.addClass(buttonIcon, 'fa-minus-square-o');
      } else {
        Util.addClass(buttonIcon, 'fa-plus-square-o');
      }
      button.appendChild(buttonIcon);
      anchor.appendChild(button);

      var childMenuDOM = document.createElement('ul');
      sidebarCB(childMenuDOM, submenu[i].Children);
      li.appendChild(childMenuDOM);
    }

    element.appendChild(li);
  }
  
}

function sidebarScroll() {
  var container = document.querySelector('.sidebar-menu-container');
  var currentElem = document.querySelector('.sidebar li.current');
  if (!currentElem || !container) return;

  var topPos = currentElem.offsetTop - (container.clientHeight/4);
  container.scrollTop = topPos;
}

function showMenu(e){
  var sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  var shouldExpand = !Util.hasClass(sidebar, 'sidebar--state-show');

  if (shouldExpand) {
    Util.addClass(sidebar, 'sidebar--state-show');
  } else {
    Util.removeClass(sidebar, 'sidebar--state-show');
  }

  var toggles = document.querySelectorAll('.sidebar-toggle');
  Array.prototype.forEach.call(toggles, function(el, i){
    el.setAttribute('aria-expanded', shouldExpand);
  });
}

function sidebarExtendToggle(e) {
  e.preventDefault();
  var listItem = Util.findAncestorByClass(e.currentTarget, 'sidebar-item');
  var iconItem = listItem.querySelector('i');
  var shouldExpand = !(e.currentTarget.getAttribute('aria-expanded') == 'true');

  if (shouldExpand) {
    Util.addClass(listItem, 'active');
    Util.addClass(iconItem, 'fa-minus-square-o');
    Util.removeClass(iconItem, 'fa-plus-square-o');
  } else {
    Util.removeClass(listItem, 'active');
    Util.addClass(iconItem, 'fa-plus-square-o');
    Util.removeClass(iconItem, 'fa-minus-square-o');
  }
  e.currentTarget.setAttribute('aria-expanded', shouldExpand);
}
