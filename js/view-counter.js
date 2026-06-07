(function() {
  if (!window.COUNTER_API_URL) return;

  var el = document.getElementById('view-counter');
  if (!el || !el.dataset.postKey) return;

  var postKey = el.dataset.postKey;
  var storageKey = 'viewed_' + postKey;

  function render(count) {
    el.textContent = '· ' + count + (count == 1 ? ' view' : ' views');
  }

  var alreadyViewed = false;
  try { alreadyViewed = !!localStorage.getItem(storageKey); } catch (e) {}

  var url = window.COUNTER_API_URL + '/' + encodeURIComponent(postKey) +
    (alreadyViewed ? '?readonly=true' : '');

  fetch(url)
    .then(function(res) { return res.json(); })
    .then(function(count) {
      render(count);
      if (!alreadyViewed) {
        try { localStorage.setItem(storageKey, '1'); } catch (e) {}
      }
    })
    .catch(function() {});
})();
