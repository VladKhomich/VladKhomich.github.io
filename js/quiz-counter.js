(function() {
  if (!window.COUNTER_API_URL) return;

  var BASE_URL = window.COUNTER_API_URL + '/';

  function render(el, count) {
    el.textContent = '· ' + count + (count == 1 ? ' completion' : ' completions');
  }

  function fetchCount(quizId, readonly, onSuccess) {
    var url = BASE_URL + encodeURIComponent(quizId) + (readonly ? '?readonly=true' : '');
    fetch(url)
      .then(function(res) { return res.json(); })
      .then(onSuccess)
      .catch(function() {});
  }

  var el = document.getElementById('quiz-counter');
  if (el && el.dataset.quizId) {
    fetchCount(el.dataset.quizId, true, function(count) { render(el, count); });
  }

  window.recordQuizCompletion = function(quizId) {
    var counterEl = document.getElementById('quiz-counter');
    fetchCount(quizId, false, function(count) {
      if (counterEl) render(counterEl, count);
    });
  };
})();
