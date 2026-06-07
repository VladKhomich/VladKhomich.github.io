var quizState = {};

function evaluateBlock(id, index) {
  if (!quizState[id]) quizState[id] = { results: [] };

  var quiz = document.getElementById(id);
  var block = quiz.querySelectorAll('.quiz-question-block')[index];
  var inputs = block.querySelectorAll('input[type="checkbox"], input[type="radio"]');
  var blockCorrect = true;

  inputs.forEach(function(input) {
    var label = input.closest('.quiz-option');
    var shouldBeChecked = input.dataset.correct === 'true';
    label.classList.remove('quiz-correct', 'quiz-wrong', 'quiz-missed');

    if (input.checked && !shouldBeChecked) {
      label.classList.add('quiz-wrong');
      blockCorrect = false;
    } else if (!input.checked && shouldBeChecked) {
      label.classList.add('quiz-missed');
      blockCorrect = false;
    } else if (input.checked && shouldBeChecked) {
      label.classList.add('quiz-correct');
    }
  });

  quizState[id].results[index] = blockCorrect;
  inputs.forEach(function(i) { i.disabled = true; });

  var qResult = document.getElementById(id + '-q' + index + '-result');
  var explanation = block.dataset.explanation;
  if (blockCorrect) {
    qResult.textContent = 'Correct!';
    qResult.className = 'quiz-question-result quiz-pass';
  } else if (explanation) {
    qResult.textContent = 'ℹ️ ' + explanation;
    qResult.className = 'quiz-question-result quiz-explanation';
  } else {
    qResult.textContent = 'Not quite.';
    qResult.className = 'quiz-question-result quiz-fail';
  }
}

function checkQuestion(id, index) {
  var quiz = document.getElementById(id);
  var block = quiz.querySelectorAll('.quiz-question-block')[index];
  if (block.querySelector('input[type="checkbox"], input[type="radio"]').disabled) return;

  evaluateBlock(id, index);
  block.querySelector('.quiz-check').disabled = true;
}

function updateProgress(id, index) {
  var quiz = document.getElementById(id);
  var total = quiz.querySelectorAll('.quiz-question-block').length;
  var pct = ((index + 1) / total) * 100;
  document.getElementById(id + '-progress-fill').style.width = pct + '%';
  document.getElementById(id + '-progress-label').textContent = (index + 1) + ' / ' + total;
}

function nextQuestion(id, index) {
  var quiz = document.getElementById(id);
  var blocks = quiz.querySelectorAll('.quiz-question-block');

  if (index + 1 >= blocks.length) {
    showSummary(id);
  } else {
    blocks[index].style.display = 'none';
    blocks[index + 1].style.display = '';
    updateProgress(id, index + 1);
  }
}

function showSummary(id) {
  var quiz = document.getElementById(id);
  var blocks = quiz.querySelectorAll('.quiz-question-block');
  var total = blocks.length;

  blocks.forEach(function(block, index) {
    if (!block.querySelector('input[type="checkbox"], input[type="radio"]').disabled) {
      evaluateBlock(id, index);
    }
    block.style.display = '';
    block.querySelector('.quiz-actions').style.display = 'none';
  });

  var results = quizState[id] ? quizState[id].results : [];
  var correctCount = results.filter(Boolean).length;
  var allCorrect = correctCount === total;

  var result = document.getElementById(id + '-result');
  result.textContent = allCorrect ? 'All correct!' : correctCount + ' / ' + total + ' correct.';
  result.className = 'quiz-result ' + (allCorrect ? 'quiz-pass' : 'quiz-fail');

  quiz.querySelector('.quiz-summary').style.display = '';

  if (window.recordQuizCompletion) window.recordQuizCompletion(id);
}
