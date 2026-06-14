var quizState = {};

function isAnswered(block) {
  if (block.dataset.type === 'match') {
    return block.classList.contains('quiz-answered');
  }
  var input = block.querySelector('input[type="checkbox"], input[type="radio"]');
  return input.disabled;
}

function showQuestionResult(id, index, block, blockCorrect) {
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

function evaluateBlock(id, index) {
  if (!quizState[id]) quizState[id] = { results: [] };

  var quiz = document.getElementById(id);
  var block = quiz.querySelectorAll('.quiz-question-block')[index];

  if (block.dataset.type === 'match') {
    evaluateMatchBlock(id, index, block);
    return;
  }

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
  showQuestionResult(id, index, block, blockCorrect);
}

function evaluateMatchBlock(id, index, block) {
  var drops = block.querySelectorAll('.quiz-match-drop');
  var blockCorrect = true;

  drops.forEach(function(drop) {
    var chip = drop.querySelector('.quiz-chip');
    drop.classList.remove('quiz-correct', 'quiz-wrong');
    if (chip && chip.dataset.option === drop.dataset.correct) {
      drop.classList.add('quiz-correct');
    } else {
      drop.classList.add('quiz-wrong');
      blockCorrect = false;
    }
  });

  quizState[id].results[index] = blockCorrect;
  block.classList.add('quiz-answered');
  block.querySelectorAll('.quiz-chip').forEach(function(chip) {
    chip.setAttribute('draggable', 'false');
    chip.classList.remove('quiz-chip-selected');
  });
  showQuestionResult(id, index, block, blockCorrect);
}

function checkQuestion(id, index) {
  var quiz = document.getElementById(id);
  var block = quiz.querySelectorAll('.quiz-question-block')[index];
  if (isAnswered(block)) return;

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
    if (!isAnswered(block)) {
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

function initMatchBlock(matchEl) {
  var block = matchEl.closest('.quiz-question-block');
  var bank = matchEl.querySelector('.quiz-match-bank');
  var drops = matchEl.querySelectorAll('.quiz-match-drop');
  var chips = matchEl.querySelectorAll('.quiz-chip');
  var dragged = null;
  var selected = null;

  // Shuffle the option chips so they don't line up with their targets.
  var kids = Array.prototype.slice.call(bank.children);
  for (var i = kids.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = kids[i]; kids[i] = kids[j]; kids[j] = tmp;
  }
  kids.forEach(function(k) { bank.appendChild(k); });

  function answered() { return block.classList.contains('quiz-answered'); }

  function clearSelection() {
    if (selected) selected.classList.remove('quiz-chip-selected');
    selected = null;
  }

  // Move a chip into a zone (a drop slot or back to the bank). A drop slot
  // holds one chip, so any chip already there is bumped back to the bank.
  function place(chip, zone) {
    if (answered()) return;
    if (zone.classList.contains('quiz-match-drop')) {
      var existing = zone.querySelector('.quiz-chip');
      if (existing && existing !== chip) bank.appendChild(existing);
    }
    zone.appendChild(chip);
    clearSelection();
  }

  // Click/tap fallback so the question also works on touch devices, where
  // native HTML5 drag events don't fire: tap a chip, then tap a slot.
  function onChipClick(e) {
    if (answered()) return;
    e.stopPropagation();
    var chip = e.currentTarget;
    if (selected === chip) {
      clearSelection();
    } else {
      clearSelection();
      selected = chip;
      chip.classList.add('quiz-chip-selected');
    }
  }

  chips.forEach(function(chip) {
    chip.addEventListener('dragstart', function(e) {
      if (answered()) { e.preventDefault(); return; }
      dragged = chip;
      chip.classList.add('quiz-chip-dragging');
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    });
    chip.addEventListener('dragend', function() {
      chip.classList.remove('quiz-chip-dragging');
      dragged = null;
    });
    chip.addEventListener('click', onChipClick);
  });

  var zones = [bank];
  drops.forEach(function(d) { zones.push(d); });

  zones.forEach(function(zone) {
    zone.addEventListener('dragover', function(e) {
      if (answered()) return;
      e.preventDefault();
      zone.classList.add('quiz-match-over');
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    });
    zone.addEventListener('dragleave', function() {
      zone.classList.remove('quiz-match-over');
    });
    zone.addEventListener('drop', function(e) {
      e.preventDefault();
      zone.classList.remove('quiz-match-over');
      if (dragged) place(dragged, zone);
    });
    zone.addEventListener('click', function() {
      if (selected) place(selected, zone);
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.quiz-match').forEach(initMatchBlock);
});
