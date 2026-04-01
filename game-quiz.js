// ================================================
// GAME 1: QUIZ
// ================================================

let quizDeck = [];
let quizIdx = 0;
let quizHP = 100;
let quizScore = 0;
let quizCombo = 0;
let quizTimeLeft = 0;
let quizTimerInterval = null;
let quizDelayTimeout = null;
let quizCorrect = 0;
let quizWrong = 0;

function startQuiz() {
  quizDeck = getPrioritizedDeck(questions, 'quiz');
  quizIdx = 0;
  quizHP = 100;
  quizScore = 0;
  quizCombo = 0;
  quizCorrect = 0;
  quizWrong = 0;
  quizTimeLeft = settings.quizTimeLimit;
  stopQuizTimer();
  showScreen('screen-quiz');
  renderQuiz();
}

function renderQuiz() {
  updateQuizHUD();
  if (settings.quizTimerEnabled) {
    startQuizTimer();
  } else {
    stopQuizTimer();
  }
  if (quizIdx >= quizDeck.length) {
    quizComplete();
    return;
  }
  const q = quizDeck[quizIdx];

  document.getElementById('quiz-question').textContent = q.q;
  document.getElementById('quiz-progress').textContent = `${quizIdx + 1} / ${quizDeck.length}`;
  document.getElementById('quiz-explanation').classList.add('hidden');
  document.getElementById('quiz-next').classList.add('hidden');

  const grid = document.getElementById('quiz-choices');
  grid.innerHTML = '';
  q.a.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = ans;
    btn.onclick = () => answerQuiz(i, btn, q);
    grid.appendChild(btn);
  });
}

function answerQuiz(chosen, btn, q) {
  stopQuizTimer();
  const quizChoices = document.getElementById('quiz-choices');
  const allBtns = quizChoices ? quizChoices.querySelectorAll('.choice-btn') : document.querySelectorAll('.choice-btn');
  allBtns.forEach(b => b.disabled = true);
  const correct = chosen === q.c;

  if (allBtns[q.c]) {
    allBtns[q.c].classList.add('correct');
  }

  if (correct) {
    quizCombo++;
    quizCorrect++;
    const pts = 10 * Math.max(1, quizCombo);
    quizScore += pts;
    playerEXP += pts;
    updateQuestionStats(quizIdx, 'quiz', true);
    showToast(`✅ Correct! +${pts} EXP 🔥 x${quizCombo}`, 'ok');
    showComboPopup(`+${pts} ⭐`, btn.getBoundingClientRect().left, btn.getBoundingClientRect().top);
  } else {
    btn.classList.add('wrong');
    quizCombo = 0;
    quizWrong++;
    if (!settings.disableGameOver) {
      quizHP = Math.max(0, quizHP - 20);
    }
    updateQuestionStats(quizIdx, 'quiz', false);
    showToast('❌ Wrong!', 'err');
    document.getElementById('screen-quiz').classList.add('shake');
    setTimeout(() => document.getElementById('screen-quiz').classList.remove('shake'), 400);
  }

  if (q.ex) {
    const exBox = document.getElementById('quiz-explanation');
    exBox.textContent = q.ex;
    exBox.classList.remove('hidden');
  }
  document.getElementById('quiz-next').classList.remove('hidden');
  updateQuizHUD();

  if (!settings.disableGameOver && quizHP <= 0) {
    showToast('💀 Out of health! Game over.', 'err')
    gameOver(quizScore, quizCombo, 'quiz', quizCorrect, quizWrong);
    //setTimeout(() => { showToast('💀 Out of health! Game over.', 'err'); quizComplete(); }, 1000);
  }
}

function nextQuiz() {
  quizIdx++;
  renderQuiz();
}

function quizComplete() {
  stopQuizTimer();
  if (!settings.disableGameOver) {
    playerHP = Math.max(0, playerHP - (100 - quizHP));
  }
  playerCombo = Math.max(playerCombo, quizCombo);
  gameOver(quizScore, quizCombo, 'quiz', quizCorrect, quizWrong);
  saveToStorage();
  showToast(`🎉 Complete! Score: ${quizScore}`, 'info');
  setTimeout(() => showScreen('screen-menu'), 800);
}

function updateQuizHUD() {
  document.getElementById('quiz-hp').textContent = quizHP;
  document.getElementById('quiz-score').textContent = quizScore;
  document.getElementById('quiz-combo').textContent = quizCombo;
  const timerEl = document.getElementById('quiz-timer');
  if (timerEl) {
    timerEl.textContent = settings.quizTimerEnabled ? String(quizTimeLeft).padStart(2, '0') : '--';
  }
  document.getElementById('quiz-hpbar').style.width = `${Math.max(0, quizHP)}%`;
}

function startQuizTimer() {
  stopQuizTimer();
  if (!settings.quizTimerEnabled) return;
  quizTimeLeft = settings.quizTimeLimit;
  updateQuizHUD();
  quizTimerInterval = setInterval(() => {
    quizTimeLeft = Math.max(0, quizTimeLeft - 1);
    updateQuizHUD();
    if (quizTimeLeft <= 0) {
      handleQuizTimeout();
    }
  }, 1000);
}

function clearQuizDelayTimeout() {
  if (quizDelayTimeout) {
    clearTimeout(quizDelayTimeout);
    quizDelayTimeout = null;
  }
}

function stopQuizTimer() {
  if (quizTimerInterval) {
    clearInterval(quizTimerInterval);
    quizTimerInterval = null;
  }
  clearQuizDelayTimeout();
}

function handleQuizTimeout() {
  stopQuizTimer();
  if (quizIdx >= quizDeck.length) return;

  const quizChoices = document.getElementById('quiz-choices');
  const allBtns = quizChoices ? quizChoices.querySelectorAll('.choice-btn') : document.querySelectorAll('.choice-btn');
  allBtns.forEach(b => b.disabled = true);

  document.getElementById('screen-quiz').classList.add('shake');
  setTimeout(() => document.getElementById('screen-quiz').classList.remove('shake'), 400);

  quizCombo = 0;
  if (!settings.disableGameOver) {
    quizHP = Math.max(0, quizHP - 20);
  }
  updateQuizHUD();

  const current = quizDeck[quizIdx];
  if (current) {
    if (allBtns[current.c]) {
      allBtns[current.c].classList.add('correct');
    }
    if (current.ex) {
      const exBox = document.getElementById('quiz-explanation');
      exBox.textContent = current.ex;
      exBox.classList.remove('hidden');
    }
  }
  document.getElementById('quiz-next').classList.remove('hidden');

  if (!settings.disableGameOver && quizHP <= 0) {
    showToast('Time\x27s up! Game over.', 'err');
    gameOver(quizScore, quizCombo, 'quiz', quizCorrect, quizWrong);
    // quizDelayTimeout = setTimeout(() => {
    //   quizComplete();
    //   quizDelayTimeout = null;
    // }, 900);
    return;
  }

  showToast('⏱ Time’s up! Wrong answer.', 'err');
  quizDelayTimeout = setTimeout(() => {
    quizDelayTimeout = null;
    quizIdx++;
    if (quizIdx >= quizDeck.length) {
      quizComplete();
    } else {
      renderQuiz();
    }
  }, 900);
}