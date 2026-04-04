// ================================================
// 日本語 QUEST — Settings Module
// ================================================

function showSettings() {
  showScreen('screen-settings');
  renderSettingsScreen();
}

function renderSettingsScreen() {
  document.getElementById('quiz-timer-enabled').checked = settings.quizTimerEnabled;
  document.getElementById('scanlines-enabled').checked = settings.scanlinesEnabled;
  document.getElementById('type-hints-enabled').checked = settings.typeHintsEnabled;
  document.getElementById('disable-gameover-enabled').checked = settings.disableGameOver;
  document.getElementById('animation-enabled').checked = settings.animationEnabled !== false;
  document.getElementById('quiz-time-limit').value = settings.quizTimeLimit;
  document.getElementById('type-game-speed').value = settings.typeGameSpeed;
  document.getElementById('type-spawn-interval').value = settings.typeSpawnInterval;
  document.getElementById('match-time-limit').value = settings.matchTimeLimit;
  document.getElementById('shuffle-answers-enabled').checked = settings.shuffleAnswers !== false;
  document.getElementById('match-pair-count').value = settings.matchPairCount || 6;
  updateAnimationBodyClass();
  
  const priorityEnabled = document.getElementById('priority-enabled');
  const priorityPanel = document.getElementById('priority-panel');
  const priorityIncorrect = document.getElementById('priority-incorrect');
  const priorityTime = document.getElementById('priority-time');
  const priorityLearning = document.getElementById('priority-learning');
  const prioritySlow = document.getElementById('priority-slow');
  
  priorityEnabled.checked = settings.priority?.enabled || false;
  if (settings.priority?.enabled) {
    priorityPanel.classList.add('active');
  } else {
    priorityPanel.classList.remove('active');
  }
  
  priorityIncorrect.value = settings.priority?.global?.incorrect ?? 5;
  priorityTime.value = settings.priority?.global?.timeSinceSeen ?? 3;
  priorityLearning.value = settings.priority?.global?.learning ?? 2;
  prioritySlow.value = settings.priority?.global?.slowResponse ?? 3;
  
  document.getElementById('priority-incorrect-val').textContent = priorityIncorrect.value;
  document.getElementById('priority-time-val').textContent = priorityTime.value;
  document.getElementById('priority-learning-val').textContent = priorityLearning.value;
  document.getElementById('priority-slow-val').textContent = prioritySlow.value;
  
  const questionLimitEnabled = document.getElementById('question-limit-enabled');
  const questionLimitValue = document.getElementById('question-limit-value');
  if (questionLimitEnabled) questionLimitEnabled.checked = settings.questionLimitEnabled;
  if (questionLimitValue) questionLimitValue.value = settings.questionLimit;
  updateQuestionLimitUI();
}

function updateQuestionLimitUI() {
  const questionLimitValue = document.getElementById('question-limit-value');
  if (questionLimitValue) {
    questionLimitValue.disabled = !settings.questionLimitEnabled;
  }
}


function updateSettingsFromUI() {
  settings.quizTimerEnabled = document.getElementById('quiz-timer-enabled').checked;
  settings.scanlinesEnabled = document.getElementById('scanlines-enabled').checked;
  settings.typeHintsEnabled = document.getElementById('type-hints-enabled').checked;
  settings.disableGameOver = document.getElementById('disable-gameover-enabled').checked;
  settings.quizTimeLimit = parseInt(document.getElementById('quiz-time-limit').value, 10);
  settings.typeGameSpeed = document.getElementById('type-game-speed').value;
  settings.typeSpawnInterval = document.getElementById('type-spawn-interval').value;
  settings.matchTimeLimit = parseInt(document.getElementById('match-time-limit').value, 10);
  settings.shuffleAnswers = document.getElementById('shuffle-answers-enabled').checked;
  settings.matchPairCount = parseInt(document.getElementById('match-pair-count').value, 10);
  
  const priorityEnabled = document.getElementById('priority-enabled').checked;
  const priorityPanel = document.getElementById('priority-panel');
  const priorityIncorrect = document.getElementById('priority-incorrect');
  const priorityTime = document.getElementById('priority-time');
  const priorityLearning = document.getElementById('priority-learning');
  const prioritySlow = document.getElementById('priority-slow');
  
  if (priorityEnabled) {
    priorityPanel.classList.add('active');
  } else {
    priorityPanel.classList.remove('active');
  }
  
  settings.priority = settings.priority || {};
  settings.priority.enabled = priorityEnabled;
  settings.priority.global = settings.priority.global || { incorrect: 5, timeSinceSeen: 3, learning: 2, slowResponse: 3 };
  settings.priority.global.incorrect = parseInt(priorityIncorrect.value, 10);
  settings.priority.global.timeSinceSeen = parseInt(priorityTime.value, 10);
  settings.priority.global.learning = parseInt(priorityLearning.value, 10);
  settings.priority.global.slowResponse = parseInt(prioritySlow.value, 10);
  
  settings.animationEnabled = document.getElementById('animation-enabled').checked;
  
  const questionLimitEnabled = document.getElementById('question-limit-enabled');
  const questionLimitValue = document.getElementById('question-limit-value');
  if (questionLimitEnabled) {
    settings.questionLimitEnabled = questionLimitEnabled.checked;
  }
  if (questionLimitValue) {
    let val = parseInt(questionLimitValue.value, 10);
    if (isNaN(val) || val < 5) val = 5;
    if (val > 200) val = 200;
    settings.questionLimit = val;
  }
  updateQuestionLimitUI();
  
  saveSettingsToStorage();
  applyScanlinesVisibility();
  updateAnimationBodyClass();
}

function openGamePrioritySettings(gameType) {
  currentGameType = gameType;
  const modal = document.getElementById('game-priority-modal');
  const titles = { quiz: '📝 Quiz', listen: '🎧 Listening', flash: '🃏 Flashcard', match: '🧩 Match', type: '⌨ Falling Words', write: '✍️ Writing' };
  document.getElementById('game-priority-title').textContent = `⚙️ ${titles[gameType]} Settings`;
  
  const perGame = settings.priority?.perGame?.[gameType];
  const override = perGame?.enabled === true || perGame?.enabled === 1;
  
  document.getElementById('game-priority-override').checked = override;
  document.getElementById('game-priority-weights').classList.toggle('active', override);
  
  if (override) {
    document.getElementById('game-priority-incorrect').value = perGame.incorrect ?? 5;
    document.getElementById('game-priority-time').value = perGame.timeSinceSeen ?? 3;
    document.getElementById('game-priority-learning').value = perGame.learning ?? 2;
    document.getElementById('game-priority-slow').value = perGame.slowResponse ?? 3;
  } else {
    document.getElementById('game-priority-incorrect').value = settings.priority?.global?.incorrect ?? 5;
    document.getElementById('game-priority-time').value = settings.priority?.global?.timeSinceSeen ?? 3;
    document.getElementById('game-priority-learning').value = settings.priority?.global?.learning ?? 2;
    document.getElementById('game-priority-slow').value = settings.priority?.global?.slowResponse ?? 3;
  }
  
  document.getElementById('game-priority-incorrect-val').textContent = document.getElementById('game-priority-incorrect').value;
  document.getElementById('game-priority-time-val').textContent = document.getElementById('game-priority-time').value;
  document.getElementById('game-priority-learning-val').textContent = document.getElementById('game-priority-learning').value;
  document.getElementById('game-priority-slow-val').textContent = document.getElementById('game-priority-slow').value;
  
  modal.classList.remove('hidden');
}

function closeGamePrioritySettings() {
  document.getElementById('game-priority-modal').classList.add('hidden');
  currentGameType = null;
}

function updateGamePriorityOverride() {
  const override = document.getElementById('game-priority-override').checked;
  document.getElementById('game-priority-weights').classList.toggle('active', override);
  saveGamePrioritySettings();
}

function updateGamePriorityValues() {
  document.getElementById('game-priority-incorrect-val').textContent = document.getElementById('game-priority-incorrect').value;
  document.getElementById('game-priority-time-val').textContent = document.getElementById('game-priority-time').value;
  document.getElementById('game-priority-learning-val').textContent = document.getElementById('game-priority-learning').value;
  document.getElementById('game-priority-slow-val').textContent = document.getElementById('game-priority-slow').value;
  saveGamePrioritySettings();
}

function saveGamePrioritySettings() {
  if (!currentGameType) return;
  
  const override = document.getElementById('game-priority-override').checked;
  settings.priority = settings.priority || {};
  settings.priority.perGame = settings.priority.perGame || {};
  
  if (override) {
    settings.priority.perGame[currentGameType] = {
      enabled: true,
      incorrect: parseInt(document.getElementById('game-priority-incorrect').value, 10),
      timeSinceSeen: parseInt(document.getElementById('game-priority-time').value, 10),
      learning: parseInt(document.getElementById('game-priority-learning').value, 10),
      slowResponse: parseInt(document.getElementById('game-priority-slow').value, 10)
    };
  } else {
    settings.priority.perGame[currentGameType] = { enabled: null, incorrect: 8, timeSinceSeen: 3, learning: 2, slowResponse: 3 };
  }
  
  saveSettingsToStorage();
}

function resetPlayerProgress() {
  const confirmed = confirm(
    '⚠️ WARNING: Reset All Progress\n\n' +
    'This will reset:\n' +
    '• HP to 100\n' +
    '• EXP to 0\n' +
    '• Level to 1\n' +
    '• Daily streak to 0\n' +
    '• All question stats\n' +
    '• All session history\n\n' +
    'This action CANNOT be undone.\n\n' +
    'Are you sure you want to continue?'
  );
  
  if (!confirmed) return;
  
  playerHP = 100;
  playerEXP = 0;
  playerLevel = 1;
  playerCombo = 0;
  questionStats = {};
  sessionHistory = [];
  
  localStorage.removeItem('jq_hp');
  localStorage.removeItem('jq_exp');
  localStorage.removeItem('jq_level');
  localStorage.removeItem('jq_combo');
  localStorage.removeItem('jq_question_stats');
  localStorage.removeItem('jq_session_history');
  localStorage.removeItem('jq_daily_streak');
  localStorage.removeItem('jq_streak_date');
  
  saveToStorage();
  updateMenuUI();
  showToast('💀 All progress has been reset!', 'err');
}

function resetSettingsToDefault() {
  settings = {
    quizTimerEnabled: false,
    quizTimeLimit: 20,
    scanlinesEnabled: false,
    typeHintsEnabled: true,
    typeGameSpeed: 'medium',
    typeSpawnInterval: 'medium',
    matchTimeLimit: 60,
    matchPairCount: 6,
    shuffleAnswers: true,
    disableGameOver: false,
    animationEnabled: true,
    questionLimitEnabled: false,
    questionLimit: 20,
    priority: {
      enabled: true,
      global: { incorrect: 8, timeSinceSeen: 3, learning: 2, slowResponse: 3 },
      perGame: {
        quiz: { enabled: null, incorrect: 8, timeSinceSeen: 3, learning: 2, slowResponse: 3 },
        listen: { enabled: null, incorrect: 8, timeSinceSeen: 3, learning: 2, slowResponse: 3 },
        flash: { enabled: null, incorrect: 8, timeSinceSeen: 3, learning: 2, slowResponse: 3 },
        match: { enabled: null, incorrect: 8, timeSinceSeen: 3, learning: 2, slowResponse: 3 },
        type: { enabled: null, incorrect: 8, timeSinceSeen: 3, learning: 2, slowResponse: 3 },
        write: { enabled: null, incorrect: 8, timeSinceSeen: 3, learning: 2, slowResponse: 3 }
      }
    }
  };
  
  saveSettingsToStorage();
  renderSettingsScreen();
  applyScanlinesVisibility();
  updateAnimationBodyClass();
  showToast('⚙️ Settings reset to default', 'ok');
}
