function searchChange(e){
  var label = document.querySelector('.header-search-label');
  if (!label) return;
  
  if (e.target.value === '') {
    label.setAttribute('style', '');
  } else {
    label.setAttribute('style', 'visibility: hidden;');
  }
}
