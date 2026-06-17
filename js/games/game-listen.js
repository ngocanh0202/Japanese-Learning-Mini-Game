// ================================================
// GAME 5: LISTENING QUIZ
// ================================================

let listenDeck = [];
let listenIdx = 0;
let listenHP = 100;
let listenScore = 0;
let listenCombo = 0;
let listenTimeLeft = 0;
let listenTimerInterval = null;
let listenDelayTimeout = null;
let listenCorrect = 0;
let listenWrong = 0;
const LISTEN_RESUME_STORAGE_KEY = 'jq_resume_listen';

function createListenResumeState() {
  if (!Array.isArray(listenDeck) || listenDeck.length === 0) return null;
  if (listenIdx >= listenDeck.length) return null;

  return {
    version: 1,
    id: `listen-${Date.now()}`,
    type: 'listen',
    activeSetId: activeSetId || 'set-default',
    savedAt: new Date().toISOString(),
    deck: listenDeck.map(q => ({ ...q })),
    idx: listenIdx,
    hp: listenHP,
    score: listenScore,
    combo: listenCombo,
    correct: listenCorrect,
    wrong: listenWrong
  };
}

function saveListenResumeState() {
  const state = createListenResumeState();
  if (!state) {
    clearListenResumeState();
    return false;
  }
  localStorage.setItem(LISTEN_RESUME_STORAGE_KEY, JSON.stringify(state));
  return state;
}

function loadListenResumeState() {
  try {
    const raw = localStorage.getItem(LISTEN_RESUME_STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!state || state.version !== 1 || state.type !== 'listen') return null;
    if (state.activeSetId !== (activeSetId || 'set-default')) return null;
    if (!Array.isArray(state.deck) || state.deck.length === 0) return null;
    if (!Number.isInteger(state.idx) || state.idx < 0 || state.idx >= state.deck.length) return null;
    return state;
  } catch (e) {
    clearListenResumeState();
    return null;
  }
}

function clearListenResumeState() {
  localStorage.removeItem(LISTEN_RESUME_STORAGE_KEY);
}

function resumeListenFromState() {
  const state = loadListenResumeState();
  if (!state) return false;

  listenDeck = state.deck.map(q => ({ ...q }));
  listenIdx = state.idx;
  listenHP = state.hp;
  listenScore = state.score;
  listenCombo = state.combo;
  listenCorrect = state.correct;
  listenWrong = state.wrong;
  listenTimeLeft = settings.quizTimeLimit;
  stopListenTimer();
  clearListenResumeState();
  showScreen('screen-listen');
  renderListen();
  return true;
}

function syncListenIndexFromNAServerState() {
  if (!(typeof isNAServerGameSessionActive === 'function' && isNAServerGameSessionActive())) return false;
  const state = typeof getNAServerGameState === 'function' ? getNAServerGameState() : null;
  if (!state || state.game_type !== 'listen') return false;
  const currentQuestionId = state.current_question?.id;
  if (currentQuestionId) {
    const index = listenDeck.findIndex(q => q.id === currentQuestionId || q.questionId === currentQuestionId);
    if (index >= 0) {
      listenIdx = index;
      return true;
    }
  }
  if (Number.isInteger(state.current_index)) {
    listenIdx = state.current_index;
    return true;
  }
  return false;
}

function startListen() {
  clearListenResumeState();
  stopListenTimer();
  const sourceQuestions = (typeof isNAServerGameSessionActive === 'function' && isNAServerGameSessionActive())
    ? [...questions]
    : getPrioritizedDeck(questions, 'listen');
  listenDeck = sourceQuestions.map(q => ({
    ...q,
    questionId: generateQuestionId(q)
  }));
  const serverSessionActive = typeof isNAServerGameSessionActive === 'function' && isNAServerGameSessionActive();
  if (settings.questionLimitEnabled && !serverSessionActive) {
    listenDeck = listenDeck.slice(0, settings.questionLimit);
  }
  if (listenDeck.length === 0) {
    handleEmptyGameDeck('listen');
    return;
  }
  const serverState = typeof getNAServerGameState === 'function' && serverSessionActive
    ? getNAServerGameState()
    : null;
  if (serverSessionActive && serverState?.game_over && !serverState.current_question) {
    listenComplete();
    return;
  }
  listenIdx = serverState?.game_type === 'listen' ? (serverState.current_index || 0) : 0;
  syncListenIndexFromNAServerState();
  listenHP = serverState?.game_type === 'listen' ? (serverState.hp ?? 100) : 100;
  listenScore = serverState?.game_type === 'listen' ? (serverState.score || 0) : 0;
  listenCombo = serverState?.game_type === 'listen' ? (serverState.combo || 0) : 0;
  listenCorrect = serverState?.game_type === 'listen' ? (serverState.correct_count || 0) : 0;
  listenWrong = serverState?.game_type === 'listen' ? (serverState.wrong_count || 0) : 0;
  showScreen('screen-listen');
  renderListen();
}

let listenQuestionStartTime = 0;

function renderListen() {
  const container = document.getElementById('screen-listen');
  if (!container) return;

  if (listenIdx >= listenDeck.length) {
    return listenComplete();
  }

  const q = listenDeck[listenIdx];
  listenQuestionStartTime = Date.now();
  const serverState = typeof getNAServerGameState === 'function' && isNAServerGameSessionActive()
    ? getNAServerGameState()
    : null;
  const progressIndex = serverState?.game_type === 'listen'
    ? Math.min((serverState.current_index || 0) + 1, serverState.total || listenDeck.length)
    : listenIdx + 1;
  const progressTotal = serverState?.game_type === 'listen' ? (serverState.total || listenDeck.length) : listenDeck.length;
  document.getElementById('listen-progress').textContent = `${progressIndex} / ${progressTotal}`;
  document.getElementById('listen-audio-status').textContent = 'Click Play to hear the Japanese word.';
  document.getElementById('listen-explanation').classList.add('hidden');
  document.getElementById('listen-next').classList.add('hidden');
  
  updateListenHUD();
  if (settings.quizTimerEnabled) {
    startListenTimer();
  } else {
    stopListenTimer();
  }

  const choices = document.getElementById('listen-choices');
  choices.innerHTML = '';

  const { options, correctIndex, originalIndexes } = shuffleAnswerOptions(q);
  options.forEach((answer, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice-btn listen-choice-btn';
    btn.textContent = answer;
    btn.onclick = () => answerListen(index, btn, q, correctIndex, originalIndexes);
    choices.appendChild(btn);
  });

  if (serverState?.game_type === 'listen' && serverState.current_answered && serverState.current_answer) {
    renderServerAnsweredChoices({
      buttons: choices.querySelectorAll('.listen-choice-btn'),
      answer: serverState.current_answer,
      originalIndexes,
      explanationEl: document.getElementById('listen-explanation'),
      explanationText: q.ex || q.translation || 'No explanation available.',
      nextBtn: document.getElementById('listen-next'),
    });
  }

}

function selectJapaneseVoice(voices) {
  if (!Array.isArray(voices)) return null;
  return voices.find(voice => /^ja([-_]|$)/i.test(voice.lang || ''))
    || voices.find(voice => /japanese|nihongo|日本/i.test(voice.name || ''))
    || null;
}

function playListenAudio(text) {
  const status = document.getElementById('listen-audio-status');
  if (!status) return;

  if (!text) {
    status.textContent = 'No audio text available.';
    return;
  }

  if (!('speechSynthesis' in window)) {
    status.textContent = 'Audio not supported in this browser.';
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  const voice = selectJapaneseVoice(window.speechSynthesis.getVoices?.());
  if (voice) utterance.voice = voice;
  utterance.rate = 0.9;
  utterance.onstart = () => {
    status.textContent = '🔊 Playing audio...';
  };
  utterance.onend = () => {
    status.textContent = 'Listen to the Japanese word, then choose the correct reading.';
  };
  utterance.onerror = (event) => {
    const detail = event?.error ? ` (${event.error})` : '';
    status.textContent = `❌ Audio playback failed${detail}. Click Play again or check browser TTS voices.`;
  };
  window.speechSynthesis.speak(utterance);
}

function replayListenAudio() {
  if (listenIdx >= listenDeck.length) return;
  const q = listenDeck[listenIdx];
  playListenAudio(q.word);
}

async function answerListen(choice, btn, q, correctIndex, originalIndexes = null) {
  stopListenTimer();
  const responseTime = Date.now() - listenQuestionStartTime;
  const buttons = document.querySelectorAll('.listen-choice-btn');
  buttons.forEach(b => b.disabled = true);

  let isCorrect = choice === correctIndex;
  let serverChecked = false;
  const shouldCheckOnServer = typeof isNAServerGameSessionActive === 'function' && isNAServerGameSessionActive();
    if (shouldCheckOnServer && typeof submitGameAnswerOnNAServer === 'function') {
      try {
        const answerIndex = Array.isArray(originalIndexes) ? originalIndexes[choice] : choice;
        if (typeof setAnswerButtonLoading === 'function') setAnswerButtonLoading(btn, true);
        const result = await submitGameAnswerOnNAServer(q.id || q.questionId, answerIndex, responseTime, 'listen');
        if (result.sync_required) {
          syncListenIndexFromNAServerState();
          renderListen();
          showToast('Game session synced. Please answer the current question.', 'info');
          return;
        }
        isCorrect = !!result.correct;
        const serverCorrectIndex = result.correct_index;
        correctIndex = Array.isArray(originalIndexes) ? originalIndexes.indexOf(serverCorrectIndex) : serverCorrectIndex;
        q.c = serverCorrectIndex;
        listenHP = typeof result.hp === 'number' ? result.hp : listenHP;
        listenScore = typeof result.score === 'number' ? result.score : listenScore;
        listenCombo = typeof result.combo === 'number' ? result.combo : listenCombo;
        listenCorrect = typeof result.correct_count === 'number' ? result.correct_count : listenCorrect;
        listenWrong = typeof result.wrong_count === 'number' ? result.wrong_count : listenWrong;
        serverChecked = true;
      } catch (error) {
        if (typeof setAnswerButtonLoading === 'function') setAnswerButtonLoading(btn, false);
        buttons.forEach(b => b.disabled = false);
        showToast(`Answer check failed: ${error.message}`, 'err');
        return;
      } finally {
        if (typeof setAnswerButtonLoading === 'function') setAnswerButtonLoading(btn, false);
      }
  } else if ((q.c === undefined || q.c === null) && typeof submitGameAnswerOnNAServer === 'function') {
    buttons.forEach(b => b.disabled = false);
    showToast('Answer check requires an active NAServer game session', 'err');
    return;
  }
  let cooldownPrompted = false;
    if (isCorrect) {
      btn.classList.add('correct');
      if (!serverChecked) {
        listenCombo++;
        listenCorrect++;
      }
      const points = Math.floor(BASE_XP_REWARD * Math.max(1, listenCombo) * 1.5);
      if (!serverChecked) {
        listenScore += points;
        playerEXP += points;
      }
    if (!serverChecked) updateQuestionStats(listenDeck[listenIdx].questionId, 'listen', true, responseTime);
    cooldownPrompted = maybeApplyFastCorrectCooldown(listenDeck[listenIdx].questionId, 'listen', responseTime, (applied) => {
      if (applied && listenIdx < listenDeck.length) {
        nextListen();
      } else {
        document.getElementById('listen-next').classList.remove('hidden');
      }
    });
    showToast(`✅ Correct! +${points} EXP`, 'ok');
  } else {
      btn.classList.add('wrong');
      if (!settings.disableGameOver) {
        if (!serverChecked) listenHP = Math.max(0, listenHP - 20);
      }
      if (!serverChecked) {
        listenCombo = 0;
        listenWrong++;
      }
      if (serverChecked) updateListenHUD();
    if (!serverChecked) updateQuestionStats(listenDeck[listenIdx].questionId, 'listen', false, responseTime);
    showToast('❌ Wrong answer!', 'err');
    document.getElementById('screen-listen').classList.add('shake');
    setTimeout(() => document.getElementById('screen-listen').classList.remove('shake'), 400);
  }

  const correctButton = correctIndex !== null ? buttons[correctIndex] : null;
  if (correctButton) correctButton.classList.add('correct');

  const explanation = document.getElementById('listen-explanation');
  explanation.textContent = q.ex || q.translation || 'No explanation available.';
  explanation.classList.remove('hidden');
  document.getElementById('listen-next').classList.toggle('hidden', isCorrect && cooldownPrompted);
  document.getElementById('listen-score').textContent = listenScore;
  document.getElementById('listen-combo').textContent = listenCombo;
  document.getElementById('listen-hpbar').style.width = `${Math.max(0, listenHP)}%`;

  if (listenHP <= 0) {
    setTimeout(() => {
      showToast('💀 Out of health! Game over.', 'err');
      showListenGameOver();
    }, 1000);
  }
}

function clearListenDelayTimeout() {
  if (listenDelayTimeout) {
    clearTimeout(listenDelayTimeout);
    listenDelayTimeout = null;
  }
}

function stopListenTimer() {
  if (listenTimerInterval) {
    clearInterval(listenTimerInterval);
    listenTimerInterval = null;
  }
  clearListenDelayTimeout();
}

function startListenTimer() {
  stopListenTimer();
  if (!settings.quizTimerEnabled) return;
  listenTimeLeft = settings.quizTimeLimit;
  updateListenHUD();
  listenTimerInterval = setInterval(() => {
    listenTimeLeft = Math.max(0, listenTimeLeft - 1);
    updateListenHUD();
    if (listenTimeLeft <= 0) {
      handleListenTimeout();
    }
  }, 1000);
}

function updateListenHUD() {
  document.getElementById('listen-score').textContent = listenScore;
  document.getElementById('listen-combo').textContent = listenCombo;
  const timerEl = document.getElementById('listen-timer');
  if (timerEl) {
    timerEl.textContent = settings.quizTimerEnabled ? String(listenTimeLeft).padStart(2, '0') : '--';
  }
  document.getElementById('listen-hpbar').style.width = `${Math.max(0, listenHP)}%`;
}

function handleListenTimeout() {
  stopListenTimer();
  if (listenIdx >= listenDeck.length) return;

  listenCombo = 0;

  document.getElementById('screen-listen').classList.add('shake');
  setTimeout(() => document.getElementById('screen-listen').classList.remove('shake'), 400);


  const buttons = document.querySelectorAll('.listen-choice-btn');
  buttons.forEach(b => b.disabled = true);

  const q = listenDeck[listenIdx];
  const correctButton = buttons[q.c];
  if (correctButton) correctButton.classList.add('correct');

  const explanation = document.getElementById('listen-explanation');
  explanation.textContent = q.ex || q.translation || 'No explanation available.';
  explanation.classList.remove('hidden');
  document.getElementById('listen-next').classList.remove('hidden');

  if (!settings.disableGameOver) {
    listenHP = Math.max(0, listenHP - 20);
  }
  updateListenHUD();
  if (!settings.disableGameOver && listenHP <= 0) {
    showToast('💀 Time’s up! Game over.', 'err');
    listenDelayTimeout = setTimeout(() => {
      listenDelayTimeout = null;
      showListenGameOver();
    }, 900);
    return;
  }

  showToast('⏱ Time’s up! Wrong answer.', 'err');
  updateQuestionStats(listenDeck[listenIdx].questionId, 'listen', false, undefined);
  listenWrong++;
  listenDelayTimeout = setTimeout(() => {
    listenDelayTimeout = null;
    nextListen();
  }, 900);
}

async function nextListen() {
  if (typeof isNAServerGameSessionActive === 'function' && isNAServerGameSessionActive()) {
    if (typeof nextServerGameQuestion !== 'function') {
      showToast('NAServer next question API is not available', 'err');
      return;
    }
    try {
      const data = await nextServerGameQuestion('listen');
      const state = data.state || data || {};
      if (state.game_over || !state.current_question) {
        listenComplete();
        return;
      }
      startListen();
    } catch (error) {
      showToast(`Next question failed: ${error.message}`, 'err');
    }
    return;
  }
  if (!syncListenIndexFromNAServerState()) {
    listenIdx++;
  }
  if (listenIdx < listenDeck.length) {
    renderListen();
  } else {
    listenComplete();
  }
}

function listenComplete() {
  stopListenTimer();
  clearListenResumeState();
  gameOver(listenScore, listenCombo, 'listen', listenCorrect, listenWrong, true);
  playerCombo = Math.max(playerCombo, listenCombo);
  saveToStorage();
  showToast(`🎉 Complete! Score: ${listenScore}`, 'ok');
  if (gameStartTime) {
    const elapsed = (Date.now() - gameStartTime) / 60000;
    recordPlayTime(elapsed);
  }
  setTimeout(() => showScreen('screen-menu'), 800);
}

function showListenGameOver() {
  stopListenTimer();
  clearListenResumeState();
  gameOver(listenScore, listenCombo, 'listen', listenCorrect, listenWrong);
  const el = document.getElementById('listen-go-score');
  if (el) el.textContent = listenScore;
  document.getElementById('listen-gameover')?.classList.remove('hidden');
}

function restartListen() {
  document.getElementById('listen-gameover')?.classList.add('hidden');
  startListen();
}
