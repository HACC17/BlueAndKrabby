(function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
})(onDomLoad)

function onDomLoad(){
  sidebarScroll();
}

function sidebarScroll() {
  var container = document.querySelector('.sidebar-menu-container');
  var currentElem = document.querySelector('.sidebar li.current');
  if (!currentElem || !container) return;

  var topPos = currentElem.offsetTop;
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

function searchChange(e){
  var label = document.querySelector('.header-search-label');
  if (!label) return;
  
  if (e.target.value === '') {
    label.setAttribute('style', '');
  } else {
    label.setAttribute('style', 'visibility: hidden;');
  }
}

Util = {

  hasClass: function(el, className) {
    if (!el) return;

    if (el.classList)
      return el.classList.contains(className);
    else
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
  },

  addClass: function(el, className) {
    if (!el) return;

    if (el.classList)
      el.classList.add(className);
    else
      el.className += ' ' + className;
  },

  removeClass: function(el, className){
    if (!el) return;

    if (el.classList)
      el.classList.remove(className);
    else
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  },

  findAncestorByClass: function (el, className) {
    while ((el = el.parentElement) && !this.hasClass(el, className));
    return el;
  }
};