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