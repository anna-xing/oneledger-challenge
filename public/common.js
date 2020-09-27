// Import navbar
$.get("navbar.html", function (data) {
    $("#nav-placeholder").replaceWith(data);
});

// Local storage functions
function localStore(key, val) {
  window.localStorage.setItem(key, JSON.stringify(val));
}
function localGet(key) {
  return JSON.parse(window.localStorage.getItem(key));
}