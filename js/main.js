// ================================================
// 日本語 QUEST — Main Module
// ================================================

let questions = [];
let questionSets = [];
let activeSetId = null;
let playerHP = 100;
let playerEXP = 0;
let playerLevel = 1;
let playerCombo = 0;
let dataPage = 1;
const XP_PER_LEVEL = 500;
let questionStats = {};
let sessionHistory = [];
let currentScreen = '';
let currentGameType = null;
let settings = {
  quizTimerEnabled: false,
  quizTimeLimit: 20,
  typeGameSpeed: 'medium',
  typeSpawnInterval: 'medium',
  typeHintsEnabled: true,
  matchTimeLimit: 60,
  scanlinesEnabled: false,
  disableGameOver: false,
  animationEnabled: true,
  questionLimitEnabled: false,
  questionLimit: 20,
  shuffleAnswers: true,
  matchPairCount: 6,
  fastCorrectCooldownEnabled: true,
  fastCorrectCooldownDays: 3,
  fastCorrectThresholdSeconds: 8,
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

document.addEventListener('DOMContentLoaded', () => {
  initStars();
  loadSettingsFromStorage();
  loadFromStorage();
  loadQuestionStats();
  loadSessionHistory();
  loadDailyStreak();
  applyScanlinesVisibility();
  updateAnimationBodyClass();
  
  const naserverConfig = typeof loadNAServerConfig === 'function' ? loadNAServerConfig() : null;
  const naserverConfigured = typeof isNAServerConfigured === 'function' && isNAServerConfigured(naserverConfig);
  if (typeof hydrateNAServerConfigUI === 'function') hydrateNAServerConfigUI();
  if (naserverConfigured && typeof refreshQuestionSetsFromNAServer === 'function') {
    refreshQuestionSetsFromNAServer().catch(error => {
      showToast(`NAServer sets refresh failed: ${error.message}`, 'err');
    });
  }
  
  updateMenuUI();
  showScreen('screen-menu');
});

/* ══════════════════════════════════════════════
   STARS BACKGROUND
══════════════════════════════════════════════ */
function initStars() {
  const canvas = document.getElementById('stars-bg');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawStars();
  });

  const stars = Array.from({ length: 160 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.4 + 0.2,
    a: Math.random(),
    speed: Math.random() * 0.02 + 0.005
  }));

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.speed;
      ctx.globalAlpha = 0.2 + 0.8 * Math.abs(Math.sin(s.a));
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(drawStars);
  }
  drawStars();
}

/* ══════════════════════════════════════════════
   SCREEN MANAGEMENT
══════════════════════════════════════════════ */
function showScreen(id) {
  if (id === 'screen-stats' && !(typeof isNAServerConfigured === 'function' && isNAServerConfigured())) {
    showToast('Please login to NAServer before opening Learning Stats.', 'err');
    if (typeof openNAServerAuthModal === 'function') openNAServerAuthModal('login');
    return;
  }
  const prevScreen = currentScreen;
  currentScreen = id;
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const el = document.getElementById(id);
  el.style.display = 'flex';
  el.classList.add('active');
  if (prevScreen === 'screen-match' && id !== 'screen-match') {
    if (typeof stopMatchTimer === 'function') stopMatchTimer();
  }
  if (id === 'screen-data') {
    refreshQuestionSetUI();
    refreshDataPreview();
  }
  if (id === 'screen-menu') updateMenuUI();
  if (id === 'screen-settings') renderSettingsScreen();
  if (id === 'screen-stats') renderStatsScreen();
}

/* ══════════════════════════════════════════════
   MENU UI
══════════════════════════════════════════════ */
function updateMenuUI() {

  document.getElementById('menu-hp').style.width = `${Math.max(0, playerHP)}%`;
  document.getElementById('menu-exp').style.width = `${Math.min(100, (playerEXP / getXpForLevel(playerLevel)) * 100)}%`;
  const levelEl = document.getElementById('menu-level');
  if (levelEl) levelEl.textContent = playerLevel;
  document.getElementById('menu-combo').textContent = playerCombo;
  document.getElementById('data-count').textContent = `${questions.length} loaded questions`;
  const streakEl = document.getElementById('menu-streak');
  if (streakEl) streakEl.textContent = dailyStreak.currentStreak;
}

/* ══════════════════════════════════════════════
   TOAST + COMBO POPUP
══════════════════════════════════════════════ */
let toastTimer;
function showToast(msg, type = 'info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast toast-${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2000);
}

function showComboPopup(text, x, y) {
  const el = document.createElement('div');
  el.className = 'combo-popup';
  el.textContent = text;
  el.style.left = (x || window.innerWidth / 2) + 'px';
  el.style.top = (y || window.innerHeight / 2) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

/* ══════════════════════════════════════════════
   GAME ROUTER
══════════════════════════════════════════════ */
async function startGame(type) {
  if (typeof isNAServerBusy === 'function' && isNAServerBusy()) {
    showToast('NAServer sync is running. Please wait.', 'info');
    return;
  }

  if (typeof isNAServerConfigured === 'function' && isNAServerConfigured()) {
    try {
      if (typeof setNAServerBusy === 'function') setNAServerBusy(true, 'Preparing NAServer game deck...', 20);
      let hasServerResume = false;
      try {
        await resumeServerGame(type);
        hasServerResume = true;
      } catch (resumeError) {
        const noActiveSession = typeof isNAServerNotFoundError === 'function'
          ? isNAServerNotFoundError(resumeError)
          : /not found|session not found|no active session/i.test(resumeError?.message || '');
        if (!noActiveSession) throw resumeError;
        await startServerGame(type);
      }
      if (questions.length === 0) {
        showToast('No server questions available for this set.', 'err');
        return;
      }
      if (hasServerResume) {
        const opened = openGameResumeModal(type, {
          source: 'server',
          hasResume: true,
          onContinue: async () => {
            await resumeServerGame(type);
            gameStartTime = Date.now();
            startFreshGame(type);
          },
          onRestart: async () => {
            if (typeof setNAServerBusy === 'function') setNAServerBusy(true, 'Starting new NAServer game...', 20);
            try {
              if (typeof clearGameResumeState === 'function') clearGameResumeState(type);
              await startServerGame(type);
              if (typeof clearGameResumeState === 'function') clearGameResumeState(type);
              gameStartTime = Date.now();
              startFreshGame(type);
            } finally {
              if (typeof setNAServerBusy === 'function') setNAServerBusy(false);
            }
          }
        });
        if (opened) return;
      }
    } catch (error) {
      showToast(`NAServer game start failed: ${error.message}`, 'err');
      return;
    } finally {
      if (typeof setNAServerBusy === 'function') setNAServerBusy(false);
    }
  }

  if (questions.length === 0) {
    showToast('❌ No questions available! Please import data.', 'err');
    return;
  }
  gameStartTime = Date.now();
  const serverSessionActive = typeof isNAServerGameSessionActive === 'function' && isNAServerGameSessionActive();
  if (!serverSessionActive && typeof openGameResumeModal === 'function' && openGameResumeModal(type)) return;
  startFreshGame(type);
}

function startFreshGame(type) {
  if (type === 'quiz') startQuiz();
  if (type === 'listen') startListen();
  if (type === 'flash') startFlash();
  if (type === 'type') startTyping();
  if (type === 'match') startMatch();
  if (type === 'write') startWrite();
}

function getGameResumeLabel(type) {
  const labels = {
    quiz: 'Quiz',
    listen: 'Listening',
    flash: 'Flashcard',
    match: 'Match',
    type: 'Falling Words',
    write: 'Writing'
  };
  return labels[type] || 'Game';
}

function getCurrentResumeGameType() {
  const screenMap = {
    'screen-quiz': 'quiz',
    'screen-listen': 'listen',
    'screen-flash': 'flash',
    'screen-match': 'match',
    'screen-type': 'type',
    'screen-write': 'write'
  };
  return screenMap[currentScreen] || null;
}

function openGameResumeModal(type, options = {}) {
  const hasResume = options.hasResume === true
    || (typeof loadGameResumeState === 'function' && !!loadGameResumeState(type));
  if (!hasResume) return false;

  const modal = document.getElementById('quiz-resume-modal');
  const title = document.getElementById('quiz-resume-title');
  const continueBtn = document.getElementById('quiz-resume-continue');
  const restartBtn = document.getElementById('quiz-resume-restart');
  if (!modal || !continueBtn || !restartBtn) return false;

  const label = getGameResumeLabel(type);
  if (title) title.textContent = `RESUME ${label.toUpperCase()}?`;
  const message = typeof modal.querySelector === 'function' ? modal.querySelector('.cooldown-modal-message') : null;
  if (message) {
    message.textContent = options.source === 'server'
      ? `You have an unfinished ${label} session saved on NAServer.`
      : `You have an unfinished ${label} session.`;
  }

  continueBtn.onclick = async () => {
    modal.classList.add('hidden');
    try {
      if (typeof options.onContinue === 'function') {
        await options.onContinue();
      } else if (typeof resumeGameFromState === 'function' && !resumeGameFromState(type)) {
        startFreshGame(type);
      }
    } catch (error) {
      showToast(`Resume failed: ${error.message}`, 'err');
    }
  };
  restartBtn.onclick = async () => {
    modal.classList.add('hidden');
    try {
      if (typeof options.onRestart === 'function') {
        await options.onRestart();
      } else {
        if (typeof clearGameResumeState === 'function') clearGameResumeState(type);
        startFreshGame(type);
      }
    } catch (error) {
      showToast(`Restart failed: ${error.message}`, 'err');
    }
  };
  modal.classList.remove('hidden');
  continueBtn.focus();
  return true;
}

function openQuizResumeModal() {
  return openGameResumeModal('quiz');
}

function exitGame() {
  if (typeof typingLoop !== 'undefined' && typingLoop) {
    cancelAnimationFrame(typingLoop);
    typingLoop = null;
  }
  if (typeof stopQuizTimer === 'function') {
    stopQuizTimer();
  }
  if (typeof stopListenTimer === 'function') {
    stopListenTimer();
  }
  if (gameStartTime) {
    const elapsed = (Date.now() - gameStartTime) / 60000;
    recordPlayTime(elapsed);
  }
  const resumeType = getCurrentResumeGameType();
  const serverSessionActive = typeof isNAServerGameSessionActive === 'function' && isNAServerGameSessionActive();
  if (resumeType && serverSessionActive && typeof clearGameResumeState === 'function') {
    clearGameResumeState(resumeType);
  } else if (resumeType && typeof saveGameResumeState === 'function') {
    const resumeState = saveGameResumeState(resumeType);
    if (resumeState && typeof recordAbandonedSession === 'function') {
      recordAbandonedSession(resumeType, resumeState.score, resumeState.correct, resumeState.wrong, resumeState.id);
    }
  }
  saveToStorage();
  document.getElementById('modal-gameover').classList.add('hidden');
  showScreen('screen-menu');
}

let gameStartTime = null;

/* ══════════════════════════════════════════════
   UTILS
 ══════════════════════════════════════════════ */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function speakJapanese(text, statusEl) {
  if (!text) return;
  if (!('speechSynthesis' in window)) {
    if (statusEl) statusEl.textContent = 'Audio not supported.';
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showConfirmDialog({
  title = 'Confirm action',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = true
} = {}) {
  const modal = document.getElementById('app-confirm-modal');
  const titleEl = document.getElementById('app-confirm-title');
  const messageEl = document.getElementById('app-confirm-message');
  const okBtn = document.getElementById('app-confirm-ok');
  const cancelBtn = document.getElementById('app-confirm-cancel');
  if (!modal || !okBtn || !cancelBtn) {
    return Promise.resolve(false);
  }

  if (titleEl) titleEl.textContent = title;
  if (messageEl) messageEl.textContent = message;
  okBtn.textContent = confirmText;
  cancelBtn.textContent = cancelText;
  okBtn.classList.toggle('btn-danger', !!danger);
  okBtn.classList.toggle('btn-green', !danger);
  modal.classList.remove('hidden');

  return new Promise(resolve => {
    const finish = result => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      modal.removeEventListener('click', onBackdrop);
      resolve(result);
    };
    const onOk = () => finish(true);
    const onCancel = () => finish(false);
    const onBackdrop = event => {
      if (event.target === modal) finish(false);
    };
    okBtn.addEventListener('click', onOk, { once: true });
    cancelBtn.addEventListener('click', onCancel, { once: true });
    modal.addEventListener('click', onBackdrop);
  });
}

/* ══════════════════════════════════════════════
  GAME LOGIC
══════════════════════════════════════════════ */
const dictionaryGame = {
  'quiz': () => { restartGame(() => { startQuiz(); }); },
  'listen': () => { restartGame(() => { startListen(); }); },
  'flash': () => { restartGame(() => { startFlash(); }); },
  'type': () => { restartGame(() => { startTyping(); }); },
  'match': () => { restartGame(() => { startMatch(); }); },
  'write': () => { restartGame(() => { startWrite(); }); }
}

function gameOver(score, combo, type, correct, wrong, completed = false) {
  if (typeof clearGameResumeState === 'function') {
    clearGameResumeState(type);
  }
  if (completed) {
    recordSession(type, score, correct, wrong);
    playerCombo = Math.max(playerCombo, combo);
    playerEXP += score;
    saveToStorage();
    return;
  }

  if (settings.disableGameOver) {
    playerCombo = Math.max(playerCombo, combo);
    playerEXP += score;
    saveToStorage();
    return;
  }

  playerHP = Math.max(0, playerHP - 30);
  playerCombo = Math.max(playerCombo, combo);
  playerEXP += score;
  saveToStorage();
  
  const goTitle = document.getElementById('go-title');
  if (goTitle) {
    goTitle.textContent = 'GAME OVER';
  }
  document.getElementById('go-score').textContent = score;
  document.getElementById('modal-gameover').classList.remove('hidden');

  const oldBtn_restart = document.getElementById("btn-restart");
  const newBtn_restart = oldBtn_restart.cloneNode(true);
  oldBtn_restart.replaceWith(newBtn_restart);

  document.getElementById('btn-restart').addEventListener('click', dictionaryGame[type]);
}

function restartGame(onRestart) {
  document.getElementById('modal-gameover').classList.add('hidden');
  if (onRestart) onRestart();
}

/* ══════════════════════════════════════════════
  STATS SCREEN
══════════════════════════════════════════════ */
function renderStatsScreenLocal() {
  loadSessionHistory();
  const { totalCorrect, totalWrong, gameTypeStats } = computeTotalStats();
  const totalAnswers = totalCorrect + totalWrong;
  const overallAccuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
  
  const gameNames = { quiz: '📝 Quiz', listen: '🎧 Listening', flash: '🃏 Flashcard', match: '🧩 Match', type: '⌨ Falling Words', write: '✍️ Writing' };
  const gameColors = { quiz: '#0a84ff', listen: '#ff00c8', flash: '#bf5af2', match: '#ffd60a', type: '#ff2d55', write: '#30d158' };
  
  let gameTypeRows = '';
  for (const type of ['quiz', 'listen', 'flash', 'match', 'type', 'write']) {
    const stats = gameTypeStats[type] || { correct: 0, wrong: 0 };
    const typeTotal = stats.correct + stats.wrong;
    const typeAccuracy = typeTotal > 0 ? Math.round((stats.correct / typeTotal) * 100) : 0;
    const color = gameColors[type];
    
    gameTypeRows += `
      <tr>
        <td style="color: ${color}">${gameNames[type]}</td>
        <td style="color: #30d158">${stats.correct}</td>
        <td style="color: #ff2d55">${stats.wrong}</td>
        <td>${typeTotal}</td>
        <td>
          <div class="stats-accuracy-bar">
            <div class="stats-accuracy-fill" style="width: ${typeAccuracy}%; background: ${color}"></div>
          </div>
          <span class="stats-accuracy-text">${typeAccuracy}%</span>
        </td>
      </tr>`;
  }
  
  const historyEl = document.getElementById('stats-history');
  if (historyEl) {
    if (sessionHistory.length === 0) {
      historyEl.innerHTML = '<div class="stats-empty">No sessions recorded yet.</div>';
    } else {
      const sortedSessions = [...sessionHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const gameIcons = { quiz: '📝', listen: '🎧', flash: '🃏', match: '🧩', type: '⌨', write: '✍️' };
      let historyHtml = '<div class="session-history-list">';
      sortedSessions.forEach(session => {
        const total = session.correct + session.wrong;
        const accuracy = total > 0 ? Math.round((session.correct / total) * 100) : 0;
        const date = new Date(session.timestamp);
        const formattedDate = date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const icon = gameIcons[session.type] || '🎮';
        const statusLabel = session.status === 'abandoned' ? ' (Abandoned)' : '';
        const accuracyColor = accuracy >= 80 ? '#30d158' : accuracy >= 50 ? '#ffd60a' : '#ff2d55';
        historyHtml += `
          <div class="session-history-item">
            <div class="session-history-icon">${icon}</div>
            <div class="session-history-info">
              <div class="session-history-type">${gameNames[session.type] || session.type}${statusLabel}</div>
              <div class="session-history-date">${formattedDate}</div>
            </div>
            <div class="session-history-stats">
              <div class="session-history-score">+${session.score} ⭐</div>
              <div class="session-history-accuracy" style="color: ${accuracyColor}">${session.correct}/${total} (${accuracy}%)</div>
            </div>
          </div>`;
      });
      historyHtml += '</div>';
      historyEl.innerHTML = historyHtml;
    }
  }
  
  const summaryEl = document.getElementById('stats-summary');
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="stats-summary-grid">
        <div class="stats-summary-card">
          <div class="stats-summary-label">Total Answers</div>
          <div class="stats-summary-value">${totalAnswers}</div>
        </div>
        <div class="stats-summary-card stats-card-correct">
          <div class="stats-summary-label">Correct</div>
          <div class="stats-summary-value" style="color: #30d158">${totalCorrect}</div>
        </div>
        <div class="stats-summary-card stats-card-wrong">
          <div class="stats-summary-label">Wrong</div>
          <div class="stats-summary-value" style="color: #ff2d55">${totalWrong}</div>
        </div>
        <div class="stats-summary-card stats-card-accuracy">
          <div class="stats-summary-label">Accuracy Rate</div>
          <div class="stats-summary-value" style="color: ${overallAccuracy >= 80 ? '#30d158' : overallAccuracy >= 50 ? '#ffd60a' : '#ff2d55'}">${overallAccuracy}%</div>
          <div class="stats-accuracy-bar stats-summary-bar">
            <div class="stats-accuracy-fill" style="width: ${overallAccuracy}%; background: ${overallAccuracy >= 80 ? '#30d158' : overallAccuracy >= 50 ? '#ffd60a' : '#ff2d55'}"></div>
          </div>
        </div>
        <div class="stats-summary-card">
          <div class="stats-summary-label">Level</div>
          <div class="stats-summary-value">🔰 ${playerLevel}</div>
        </div>
        <div class="stats-summary-card">
          <div class="stats-summary-label">Best Combo</div>
          <div class="stats-summary-value">🔥 ${playerCombo}x</div>
        </div>
        <div class="stats-summary-card">
          <div class="stats-summary-label">Sessions Played</div>
          <div class="stats-summary-value">${sessionHistory.length}</div>
        </div>
        <div class="stats-summary-card">
          <div class="stats-summary-label">Current EXP</div>
          <div class="stats-summary-value">⭐ ${playerEXP}/${getXpForLevel(playerLevel)}</div>
        </div>
      </div>`;
  }
  
  const tableEl = document.getElementById('stats-game-types');
  if (tableEl) {
    tableEl.innerHTML = `
      <div class="table-scroll">
        <table class="stats-table">
          <thead>
            <tr>
              <th>Game Mode</th>
              <th>Correct</th>
              <th>Wrong</th>
              <th>Total</th>
              <th>Accuracy</th>
            </tr>
          </thead>
          <tbody>${gameTypeRows}</tbody>
        </table>
      </div>`;
  }
  
  const masteryEl = document.getElementById('stats-mastery');
  if (masteryEl) {
    let mastered = 0, learning = 0, newItems = 0;
    const gameTypes = ['quiz', 'listen', 'flash', 'match', 'type', 'write'];
    
    questions.forEach((q, index) => {
      const stats = getQuestionStatsEntry(q, false);
      if (!stats) {
        newItems++;
        return;
      }
      
      let highestLevel = 'new';
      let hasAnyAttempts = false;
      const levelOrder = { 'new': 0, 'learning': 1, 'familiar': 2, 'mastered': 3 };
      
      for (const gameType of gameTypes) {
        const typeStats = stats[gameType];
        if (typeStats && typeStats.totalAttempts > 0) {
          hasAnyAttempts = true;
          const effectiveIncorrect = getEffectiveIncorrect(typeStats);
          const level = getConfidenceLevel(typeStats.correctStreak || 0, effectiveIncorrect);
          if (levelOrder[level] > levelOrder[highestLevel]) {
            highestLevel = level;
          }
        }
      }
      
      if (hasAnyAttempts) {
        if (highestLevel === 'mastered') {
          mastered++;
        } else {
          learning++;
        }
      } else {
        newItems++;
      }
    });
    
    const totalQ = questions.length || 1;
    masteryEl.innerHTML = `
      <div class="stats-mastery-grid">
        <div class="stats-mastery-item">
          <div class="mastery-circle mastery-mastered" style="--progress: ${Math.round((mastered / totalQ) * 100)}">
            <span>${mastered}</span>
          </div>
          <div class="mastery-label">Mastered</div>
        </div>
        <div class="stats-mastery-item">
          <div class="mastery-circle mastery-learning" style="--progress: ${Math.round((learning / totalQ) * 100)}">
            <span>${learning}</span>
          </div>
          <div class="mastery-label">Learning</div>
        </div>
        <div class="stats-mastery-item">
          <div class="mastery-circle mastery-new" style="--progress: ${Math.round((newItems / totalQ) * 100)}">
            <span>${newItems}</span>
          </div>
          <div class="mastery-label">New</div>
        </div>
      </div>`;
  }
}

async function renderStatsScreen() {
  const summaryEl = document.getElementById('stats-summary');
  const tableEl = document.getElementById('stats-game-types');
  const masteryEl = document.getElementById('stats-mastery');
  const historyEl = document.getElementById('stats-history');
  const loadingHtml = '<div class="stats-empty">Loading server learning stats...</div>';
  if (summaryEl) summaryEl.innerHTML = loadingHtml;
  if (tableEl) tableEl.innerHTML = loadingHtml;
  if (masteryEl) masteryEl.innerHTML = loadingHtml;
  if (historyEl) historyEl.innerHTML = loadingHtml;

  if (!(typeof isNAServerConfigured === 'function' && isNAServerConfigured())) {
    showToast('Please login to NAServer before opening Learning Stats.', 'err');
    showScreen('screen-menu');
    return;
  }

  try {
    const data = await loadLearningStatsFromNAServer();
    const summary = data.summary || {};
    const byGameType = data.byGameType || {};
    const mastery = data.mastery || { mastered: 0, learning: 0, new: 0, total: 0 };
    const history = Array.isArray(data.history) ? data.history : [];
    const gameNames = { quiz: 'Quiz', listen: 'Listening', flash: 'Flashcard', match: 'Match', type: 'Falling Words', write: 'Writing' };
    const gameColors = { quiz: '#0a84ff', listen: '#ff00c8', flash: '#bf5af2', match: '#ffd60a', type: '#ff2d55', write: '#30d158' };
    const accuracy = Math.round(summary.accuracy || 0);
    const accuracyColor = accuracy >= 80 ? '#30d158' : accuracy >= 50 ? '#ffd60a' : '#ff2d55';

    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="stats-summary-grid">
          <div class="stats-summary-card">
            <div class="stats-summary-label">Total Answers</div>
            <div class="stats-summary-value">${summary.totalAnswers || 0}</div>
          </div>
          <div class="stats-summary-card stats-card-correct">
            <div class="stats-summary-label">Correct</div>
            <div class="stats-summary-value" style="color: #30d158">${summary.correct || 0}</div>
          </div>
          <div class="stats-summary-card stats-card-wrong">
            <div class="stats-summary-label">Wrong</div>
            <div class="stats-summary-value" style="color: #ff2d55">${summary.wrong || 0}</div>
          </div>
          <div class="stats-summary-card stats-card-accuracy">
            <div class="stats-summary-label">Accuracy Rate</div>
            <div class="stats-summary-value" style="color: ${accuracyColor}">${accuracy}%</div>
            <div class="stats-accuracy-bar stats-summary-bar">
              <div class="stats-accuracy-fill" style="width: ${accuracy}%; background: ${accuracyColor}"></div>
            </div>
          </div>
          <div class="stats-summary-card">
            <div class="stats-summary-label">Level</div>
            <div class="stats-summary-value">${summary.level || 1}</div>
          </div>
          <div class="stats-summary-card">
            <div class="stats-summary-label">Best Combo</div>
            <div class="stats-summary-value">${summary.bestCombo || 0}x</div>
          </div>
          <div class="stats-summary-card">
            <div class="stats-summary-label">Sessions Played</div>
            <div class="stats-summary-value">${summary.sessionsPlayed || history.length}</div>
          </div>
          <div class="stats-summary-card">
            <div class="stats-summary-label">Current EXP</div>
            <div class="stats-summary-value">${summary.exp || 0}</div>
          </div>
        </div>`;
    }

    if (tableEl) {
      const rows = ['quiz', 'listen', 'flash', 'match', 'type', 'write'].map(type => {
        const stats = byGameType[type] || { correct: 0, wrong: 0, total: 0, accuracy: 0 };
        const typeAccuracy = Math.round(stats.accuracy || 0);
        const color = gameColors[type];
        return `
          <tr>
            <td style="color: ${color}">${gameNames[type]}</td>
            <td style="color: #30d158">${stats.correct || 0}</td>
            <td style="color: #ff2d55">${stats.wrong || 0}</td>
            <td>${stats.total || 0}</td>
            <td>
              <div class="stats-accuracy-bar">
                <div class="stats-accuracy-fill" style="width: ${typeAccuracy}%; background: ${color}"></div>
              </div>
              <span class="stats-accuracy-text">${typeAccuracy}%</span>
            </td>
          </tr>`;
      }).join('');
      tableEl.innerHTML = `
        <div class="table-scroll">
          <table class="stats-table">
            <thead>
              <tr>
                <th>Game Mode</th>
                <th>Correct</th>
                <th>Wrong</th>
                <th>Total</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }

    if (masteryEl) {
      const totalQ = mastery.total || 1;
      masteryEl.innerHTML = `
        <div class="stats-mastery-grid">
          <div class="stats-mastery-item">
            <div class="mastery-circle mastery-mastered" style="--progress: ${Math.round(((mastery.mastered || 0) / totalQ) * 100)}">
              <span>${mastery.mastered || 0}</span>
            </div>
            <div class="mastery-label">Mastered</div>
          </div>
          <div class="stats-mastery-item">
            <div class="mastery-circle mastery-learning" style="--progress: ${Math.round(((mastery.learning || 0) / totalQ) * 100)}">
              <span>${mastery.learning || 0}</span>
            </div>
            <div class="mastery-label">Learning</div>
          </div>
          <div class="stats-mastery-item">
            <div class="mastery-circle mastery-new" style="--progress: ${Math.round(((mastery.new || 0) / totalQ) * 100)}">
              <span>${mastery.new || 0}</span>
            </div>
            <div class="mastery-label">New</div>
          </div>
        </div>`;
    }

    if (historyEl) {
      if (history.length === 0) {
        historyEl.innerHTML = '<div class="stats-empty">No server sessions recorded yet.</div>';
      } else {
        const rows = history.map(session => {
          const date = session.timestamp ? new Date(session.timestamp) : null;
          const formattedDate = date && !Number.isNaN(date.getTime())
            ? date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '--';
          const statusLabel = session.status === 'abandoned' ? ' (Abandoned)' : '';
          const sessionAccuracy = Math.round(session.accuracy || 0);
          const sessionColor = sessionAccuracy >= 80 ? '#30d158' : sessionAccuracy >= 50 ? '#ffd60a' : '#ff2d55';
          const total = session.total || ((session.correct || 0) + (session.wrong || 0));
          return `
            <div class="session-history-item">
              <div class="session-history-icon">${escapeHtml((gameNames[session.type] || '?').slice(0, 1))}</div>
              <div class="session-history-info">
                <div class="session-history-type">${escapeHtml(gameNames[session.type] || session.type || 'Unknown')}${statusLabel}</div>
                <div class="session-history-date">${formattedDate}</div>
              </div>
              <div class="session-history-stats">
                <div class="session-history-score">+${session.score || 0} EXP</div>
                <div class="session-history-accuracy" style="color: ${sessionColor}">${session.correct || 0}/${total} (${sessionAccuracy}%)</div>
              </div>
            </div>`;
        }).join('');
        historyEl.innerHTML = `<div class="session-history-list">${rows}</div>`;
      }
    }
  } catch (error) {
    const errorHtml = `<div class="stats-empty">Failed to load server learning stats: ${escapeHtml(error.message)}</div>`;
    if (summaryEl) summaryEl.innerHTML = errorHtml;
    if (tableEl) tableEl.innerHTML = errorHtml;
    if (masteryEl) masteryEl.innerHTML = errorHtml;
    if (historyEl) historyEl.innerHTML = errorHtml;
    showToast(`Failed to load server learning stats: ${error.message}`, 'err');
  }
}
