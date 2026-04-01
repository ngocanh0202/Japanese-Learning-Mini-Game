// ================================================
// 日本語 QUEST — Main Module
// ================================================

let questions = [];
let questionSets = [];
let activeSetId = null;
const XP_PER_LEVEL = 100;
let playerHP = 100;
let playerEXP = 0;
let playerLevel = 1;
let playerCombo = 0;
let dataPage = 1;
let searchQuery = '';
const DATA_PAGE_SIZE = 4;
let importEditIndex = null;
let settings = {
  quizTimerEnabled: false,
  quizTimeLimit: 20,
  typeGameSpeed: 'medium',
  typeSpawnInterval: 'medium',
  typeHintsEnabled: true,
  matchTimeLimit: 60,
  scanlinesEnabled: true,
  disableGameOver: false,
  animationEnabled: true,
  priority: {
    enabled: false,
    global: { incorrect: 5, timeSinceSeen: 3, learning: 2 },
    perGame: {
      quiz: { enabled: null, incorrect: 5, timeSinceSeen: 3, learning: 2 },
      listen: { enabled: null, incorrect: 5, timeSinceSeen: 3, learning: 2 },
      flash: { enabled: null, incorrect: 5, timeSinceSeen: 3, learning: 2 },
      match: { enabled: null, incorrect: 5, timeSinceSeen: 3, learning: 2 },
      type: { enabled: null, incorrect: 5, timeSinceSeen: 3, learning: 2 }
    }
  }
};
let questionStats = {};

/* ── INIT ── */
function adjustZoom() {
  if (window.innerWidth >= 1024) {
    document.body.style.zoom = '150%';
  } else {
    document.body.style.zoom = '100%';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  adjustZoom();
  window.addEventListener('resize', adjustZoom);
  initStars();
  loadSettingsFromStorage();
  loadFromStorage();
  loadQuestionStats();
  applyScanlinesVisibility();
  updateAnimationBodyClass();
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
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const el = document.getElementById(id);
  el.style.display = 'flex';
  el.classList.add('active');
  if (id === 'screen-data') {
    refreshQuestionSetUI();
    refreshDataPreview();
  }
  if (id === 'screen-menu') updateMenuUI();
  if (id === 'screen-settings') renderSettingsScreen();
}

/* ══════════════════════════════════════════════
   STORAGE
══════════════════════════════════════════════ */
function saveToStorage() {
  updateActiveSetFromQuestions();
  localStorage.setItem('jq_questions', JSON.stringify(questions));
  saveQuestionSetsToStorage();
  normalizePlayerProgress();
  localStorage.setItem('jq_hp', playerHP);
  localStorage.setItem('jq_exp', playerEXP);
  localStorage.setItem('jq_level', playerLevel);
  localStorage.setItem('jq_combo', playerCombo);
  localStorage.setItem('jq_settings', JSON.stringify(settings));
  saveQuestionStats();
}

function saveQuestionSetsToStorage() {
  localStorage.setItem('jq_question_sets', JSON.stringify(questionSets));
  localStorage.setItem('jq_active_set', activeSetId);
}

function getActiveQuestionSet() {
  let set = questionSets.find(s => s.id === activeSetId);
  if (!set) set = questionSets[0] || null;
  if (set && set.id !== activeSetId) activeSetId = set.id;
  return set;
}

function syncQuestionsFromActiveSet() {
  const set = getActiveQuestionSet();
  questions = set ? set.questions : [];
}

function updateActiveSetFromQuestions() {
  const set = getActiveQuestionSet();
  if (!set) return;
  if (questions !== set.questions) {
    set.questions = questions;
  }
  set.updatedAt = new Date().toISOString();
}

function loadFromStorage() {
  const storedSets = localStorage.getItem('jq_question_sets');
  const storedActiveSet = localStorage.getItem('jq_active_set');

  if (storedSets) {
    try {
      questionSets = JSON.parse(storedSets) || [];
    } catch (e) {
      questionSets = [];
    }
    activeSetId = storedActiveSet;
  } else {
    const q = localStorage.getItem('jq_questions');
    if (q) {
      try {
        const parsed = JSON.parse(q);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const now = new Date().toISOString();
          questionSets = [{
            id: `set-${Date.now()}`,
            name: 'Saved Set',
            questions: parsed,
            createdAt: now,
            updatedAt: now
          }];
          activeSetId = questionSets[0].id;
        }
      } catch (e) {
        questionSets = [];
      }
    }
  }

  if (!questionSets || questionSets.length === 0) {
    const now = new Date().toISOString();
    questionSets = [{
      id: 'set-default',
      name: 'Default Set',
      questions: [...SAMPLE_DATA],
      createdAt: now,
      updatedAt: now
    }];
    activeSetId = questionSets[0].id;
  }

  if (!questionSets.some(s => s.id === activeSetId)) {
    activeSetId = questionSets[0].id;
  }

  playerHP = parseInt(localStorage.getItem('jq_hp') ?? 100, 10);
  playerEXP = parseInt(localStorage.getItem('jq_exp') ?? 0, 10);
  playerLevel = parseInt(localStorage.getItem('jq_level') ?? 1, 10);
  playerCombo = parseInt(localStorage.getItem('jq_combo') ?? 0, 10);

  syncQuestionsFromActiveSet();
  normalizePlayerProgress();
  saveToStorage();
}

function loadSettingsFromStorage() {
  const s = localStorage.getItem('jq_settings');
  if (s) {
    try {
      const parsed = JSON.parse(s);
      settings = { ...settings, ...parsed };
    } catch (e) {
      settings = { ...settings };
    }
  }
}

function saveSettingsToStorage() {
  localStorage.setItem('jq_settings', JSON.stringify(settings));
}

function loadQuestionStats() {
  const stored = localStorage.getItem('jq_question_stats');
  if (stored) {
    try {
      questionStats = JSON.parse(stored);
    } catch (e) {
      questionStats = {};
    }
  }
  initQuestionStats(questions);
  saveQuestionStats();
}

function saveQuestionStats() {
  localStorage.setItem('jq_question_stats', JSON.stringify(questionStats));
}

function initQuestionStats(questionsArr) {
  const gameTypes = ['quiz', 'listen', 'flash', 'match', 'type'];
  questionsArr.forEach((q, index) => {
    const id = `q-${index}`;
    if (!questionStats[id]) {
      questionStats[id] = {};
    }
    gameTypes.forEach(game => {
      if (!questionStats[id][game]) {
        questionStats[id][game] = { incorrect: 0, lastSeen: null, correctStreak: 0 };
      }
    });
  });
}

function cleanupQuestionStats(deletedIndex) {
  const id = `q-${deletedIndex}`;
  delete questionStats[id];
  Object.keys(questionStats).forEach(key => {
    const num = parseInt(key.replace('q-'), 10);
    if (num > deletedIndex) {
      const newKey = `q-${num - 1}`;
      questionStats[newKey] = questionStats[key];
      delete questionStats[key];
    }
  });
  saveQuestionStats();
}

const MAX_DAYS = 30;
const MAX_TIME_BONUS = 50;

function getPriorityScore(questionIndex, gameType, weights) {
  const id = `q-${questionIndex}`;
  const stats = questionStats[id]?.[gameType];
  
  const incorrect = stats?.incorrect || 0;
  const correctStreak = stats?.correctStreak || 0;
  const lastSeen = stats?.lastSeen ? new Date(stats.lastSeen) : null;
  
  let daysSinceLastSeen = MAX_DAYS;
  if (lastSeen) {
    const now = new Date();
    daysSinceLastSeen = Math.floor((now - lastSeen) / (1000 * 60 * 60 * 24));
    if (daysSinceLastSeen < 0) daysSinceLastSeen = 0;
    if (daysSinceLastSeen > MAX_DAYS) daysSinceLastSeen = MAX_DAYS;
  }
  
  const timeBonus = Math.min(daysSinceLastSeen * weights.timeSinceSeen, MAX_TIME_BONUS);
  const learningPenalty = correctStreak * weights.learning;
  
  return (incorrect * weights.incorrect) + timeBonus - learningPenalty;
}

function getWeights(gameType) {
  if (!settings.priority?.enabled) {
    return { incorrect: 0, timeSinceSeen: 0, learning: 0 };
  }
  
  const perGame = settings.priority.perGame?.[gameType];
  if (perGame?.enabled === true || perGame?.enabled === 1) {
    return perGame;
  }
  
  return settings.priority.global || { incorrect: 5, timeSinceSeen: 3, learning: 2 };
}

function getPrioritizedDeck(questionsArr, gameType) {
  const weights = getWeights(gameType);
  
  if (!weights.incorrect && !weights.timeSinceSeen && !weights.learning) {
    return shuffle([...questionsArr]);
  }
  
  const scored = questionsArr.map((q, index) => ({
    question: q,
    index: index,
    score: getPriorityScore(index, gameType, weights)
  }));
  
  const totalWeight = scored.reduce((sum, item) => sum + Math.max(0, item.score) + 1, 0);
  
  const result = [];
  const tempIndices = [...Array(questionsArr.length).keys()];
  
  while (tempIndices.length > 0 && result.length < questionsArr.length) {
    let rand = Math.random() * totalWeight;
    let selectedIdx = -1;
    
    for (let i = 0; i < scored.length; i++) {
      const item = scored[i];
      if (!tempIndices.includes(item.index)) continue;
      
      rand -= (Math.max(0, item.score) + 1);
      if (rand <= 0) {
        selectedIdx = item.index;
        break;
      }
    }
    
    if (selectedIdx === -1) {
      const available = tempIndices.filter(idx => 
        scored.find(s => s.index === idx && Math.max(0, s.score) + 1 > 0)
      );
      if (available.length > 0) {
        selectedIdx = available[Math.floor(Math.random() * available.length)];
      } else {
        selectedIdx = tempIndices[Math.floor(Math.random() * tempIndices.length)];
      }
    }
    
    result.push(questionsArr[selectedIdx]);
    tempIndices.splice(tempIndices.indexOf(selectedIdx), 1);
  }
  
  if (result.length === 0) {
    return shuffle([...questionsArr]);
  }
  
  return result;
}

function updateQuestionStats(questionIndex, gameType, isCorrect) {
  const id = `q-${questionIndex}`;
  if (!questionStats[id]) {
    questionStats[id] = {};
  }
  if (!questionStats[id][gameType]) {
    questionStats[id][gameType] = { incorrect: 0, lastSeen: null, correctStreak: 0 };
  }
  
  const stats = questionStats[id][gameType];
  stats.lastSeen = new Date().toISOString();
  
  if (isCorrect) {
    stats.correctStreak = (stats.correctStreak || 0) + 1;
  } else {
    stats.incorrect = (stats.incorrect || 0) + 1;
    stats.correctStreak = 0;
  }
  
  saveQuestionStats();
}

function createQuestionSet(name, items = []) {
  const id = `set-${Date.now()}`;
  const now = new Date().toISOString();
  const set = {
    id,
    name: name ? name.trim() : 'Untitled Set',
    questions: Array.isArray(items) ? items : [],
    createdAt: now,
    updatedAt: now
  };
  questionSets.push(set);
  activeSetId = id;
  syncQuestionsFromActiveSet();
  saveQuestionSetsToStorage();
  return set;
}

function renameQuestionSet(id, name) {
  const set = questionSets.find(s => s.id === id);
  if (!set) return;
  if (!name || !name.trim()) return;
  set.name = name.trim();
  set.updatedAt = new Date().toISOString();
  saveQuestionSetsToStorage();
  refreshQuestionSetUI();
}

function deleteQuestionSet(id) {
  if (questionSets.length <= 1) {
    alert('Cannot delete the last question set.');
    return;
  }
  const index = questionSets.findIndex(s => s.id === id);
  if (index === -1) return;
  if (!confirm('Delete this question set?')) return;
  questionSets.splice(index, 1);
  if (!questionSets.some(s => s.id === activeSetId)) {
    activeSetId = questionSets[0].id;
  }
  syncQuestionsFromActiveSet();
  saveToStorage();
  refreshQuestionSetUI();
  refreshDataPreview();
  updateMenuUI();
}

function switchQuestionSet(id) {
  if (!questionSets.some(s => s.id === id)) return;
  activeSetId = id;
  syncQuestionsFromActiveSet();
  saveToStorage();
  refreshQuestionSetUI();
  refreshDataPreview();
  updateMenuUI();
}

function refreshQuestionSetUI() {
  const selector = document.getElementById('question-set-selector');
  const activeNameEl = document.getElementById('active-set-name');
  const activeSet = getActiveQuestionSet();

  if (selector) {
    selector.innerHTML = questionSets.map(set => `<option value="${escapeHtml(set.id)}"${set.id === activeSet?.id ? ' selected' : ''}>${escapeHtml(set.name)}</option>`).join('');
  }
  if (activeNameEl) {
    activeNameEl.textContent = activeSet ? activeSet.name : 'No active set';
  }
  if (activeSet && document.getElementById('current-count')) {
    document.getElementById('current-count').textContent = activeSet.questions.length;
  }
}

function promptCreateQuestionSet() {
  const name = prompt('Enter a name for the new question set:', `Set ${questionSets.length + 1}`);
  if (!name) return;
  createQuestionSet(name.trim(), []);
  refreshQuestionSetUI();
  refreshDataPreview();
}

function promptRenameQuestionSet() {
  const activeSet = getActiveQuestionSet();
  if (!activeSet) return;
  const name = prompt('Enter new name for this question set:', activeSet.name);
  if (!name || !name.trim()) return;
  renameQuestionSet(activeSet.id, name.trim());
}

function deleteActiveQuestionSet() {
  const activeSet = getActiveQuestionSet();
  if (!activeSet) return;
  deleteQuestionSet(activeSet.id);
}

function applyScanlinesVisibility() {
  const scanlines = document.querySelector('.scanlines');
  if (!scanlines) return;
  scanlines.style.display = settings.scanlinesEnabled ? 'block' : 'none';
}

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
  updateAnimationBodyClass();
  
  const priorityEnabled = document.getElementById('priority-enabled');
  const priorityPanel = document.getElementById('priority-panel');
  const priorityIncorrect = document.getElementById('priority-incorrect');
  const priorityTime = document.getElementById('priority-time');
  const priorityLearning = document.getElementById('priority-learning');
  
  priorityEnabled.checked = settings.priority?.enabled || false;
  if (settings.priority?.enabled) {
    priorityPanel.classList.add('active');
  } else {
    priorityPanel.classList.remove('active');
  }
  
  priorityIncorrect.value = settings.priority?.global?.incorrect ?? 5;
  priorityTime.value = settings.priority?.global?.timeSinceSeen ?? 3;
  priorityLearning.value = settings.priority?.global?.learning ?? 2;
  
  document.getElementById('priority-incorrect-val').textContent = priorityIncorrect.value;
  document.getElementById('priority-time-val').textContent = priorityTime.value;
  document.getElementById('priority-learning-val').textContent = priorityLearning.value;
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
  
  const priorityEnabled = document.getElementById('priority-enabled').checked;
  const priorityPanel = document.getElementById('priority-panel');
  const priorityIncorrect = document.getElementById('priority-incorrect');
  const priorityTime = document.getElementById('priority-time');
  const priorityLearning = document.getElementById('priority-learning');
  
  if (priorityEnabled) {
    priorityPanel.classList.add('active');
  } else {
    priorityPanel.classList.remove('active');
  }
  
  settings.priority = settings.priority || {};
  settings.priority.enabled = priorityEnabled;
  settings.priority.global = settings.priority.global || { incorrect: 5, timeSinceSeen: 3, learning: 2 };
  settings.priority.global.incorrect = parseInt(priorityIncorrect.value, 10);
  settings.priority.global.timeSinceSeen = parseInt(priorityTime.value, 10);
  settings.priority.global.learning = parseInt(priorityLearning.value, 10);
  
  settings.animationEnabled = document.getElementById('animation-enabled').checked;
  
  saveSettingsToStorage();
  applyScanlinesVisibility();
  updateAnimationBodyClass();
}

function updateAnimationBodyClass() {
  if (settings.animationEnabled === false) {
    document.body.classList.add('animations-disabled');
  } else {
    document.body.classList.remove('animations-disabled');
  }
}

/* ══════════════════════════════════════════════
   DATA MANAGEMENT
══════════════════════════════════════════════ */
function openImportModal(index = null) {
  const modal = document.getElementById('import-modal');
  const textarea = document.getElementById('import-textarea');
  const title = document.getElementById('import-modal-title');
  const replaceBtn = document.getElementById('modal-replace-btn');
  const appendBtn = document.getElementById('modal-append-btn');
  const editBtn = document.getElementById('modal-edit-btn');
  if (!modal || !textarea || !title || !replaceBtn || !appendBtn || !editBtn) return;

  if (typeof index === 'number' && index >= 0 && index < questions.length) {
    importEditIndex = index;
    textarea.value = JSON.stringify(questions[index], null, 2);
    title.textContent = '✏️ EDIT QUESTION';
    replaceBtn.classList.add('hidden');
    appendBtn.classList.add('hidden');
    editBtn.classList.remove('hidden');
  } else {
    importEditIndex = null;
    textarea.value = '';
    title.textContent = '📥 IMPORT DATA';
    replaceBtn.classList.remove('hidden');
    appendBtn.classList.remove('hidden');
    editBtn.classList.add('hidden');
  }

  modal.classList.remove('hidden');
  textarea.focus();
}

function closeImportModal() {
  const modal = document.getElementById('import-modal');
  const title = document.getElementById('import-modal-title');
  const replaceBtn = document.getElementById('modal-replace-btn');
  const appendBtn = document.getElementById('modal-append-btn');
  const editBtn = document.getElementById('modal-edit-btn');
  if (!modal) return;
  modal.classList.add('hidden');
  importEditIndex = null;
  if (title) title.textContent = '📥 IMPORT DATA';
  if (replaceBtn) replaceBtn.classList.remove('hidden');
  if (appendBtn) appendBtn.classList.remove('hidden');
  if (editBtn) editBtn.classList.add('hidden');
}

function parseImportPayload(raw) {
  if (!raw) throw new Error('Input data is empty');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('JSON must be an array with items');
  parsed.forEach((item, i) => {
    if (!item.word || !item.q || !Array.isArray(item.a) || item.c === undefined || !item.romaji) {
      throw new Error(`Item ${i} is missing required fields`);
    }
    if (item.translation !== undefined && typeof item.translation !== 'string') {
      throw new Error(`Item ${i} translation field must be a string`);
    }
  });
  return parsed;
}

function parseQuestionPayload(raw) {
  if (!raw) throw new Error('Input data is empty');
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Edit JSON must be a question object');
  }
  if (!parsed.word || !parsed.q || !Array.isArray(parsed.a) || parsed.c === undefined || !parsed.romaji) {
    throw new Error('Question object is missing required fields');
  }
  if (parsed.translation !== undefined && typeof parsed.translation !== 'string') {
    throw new Error('translation field must be a string');
  }
  return parsed;
}

function applyImportReplace() {
  try {
    const raw = document.getElementById('import-textarea').value.trim();
    const parsed = parseImportPayload(raw);
    questions = parsed;
    saveToStorage();
    setStatus('data-status', `✅ Imported ${parsed.length} questions!`, 'ok');
    refreshDataPreview();
    updateMenuUI();
    closeImportModal();
  } catch (e) {
    setStatus('data-status', `❌ Error: ${e.message}`, 'err');
    showToast(`❌ Import failed: ${e.message}`, 'err');
  }
}

function applyImportAppend() {
  try {
    const raw = document.getElementById('import-textarea').value.trim();
    const parsed = parseImportPayload(raw);
    questions = questions.concat(parsed);
    saveToStorage();
    setStatus('data-status', `✅ Added ${parsed.length} questions!`, 'ok');
    refreshDataPreview();
    updateMenuUI();
    closeImportModal();
  } catch (e) {
    setStatus('data-status', `❌ Error: ${e.message}`, 'err');
    showToast(`❌ Import failed: ${e.message}`, 'err');
  }
}

function applyEditQuestion() {
  try {
    if (importEditIndex === null || importEditIndex < 0 || importEditIndex >= questions.length) {
      throw new Error('No question selected for editing');
    }
    const raw = document.getElementById('import-textarea').value.trim();
    const parsed = parseQuestionPayload(raw);
    questions[importEditIndex] = parsed;
    saveToStorage();
    setStatus('data-status', `✅ Updated question #${importEditIndex + 1}!`, 'ok');
    refreshDataPreview();
    updateMenuUI();
    closeImportModal();
  } catch (e) {
    setStatus('data-status', `❌ Error: ${e.message}`, 'err');
    showToast(`❌ Edit failed: ${e.message}`, 'err');
  }
}

function clearData() {
  if (!confirm('Clear the current question set?')) return;
  questions = [];
  updateActiveSetFromQuestions();
  saveToStorage();
  refreshDataPreview();
  updateMenuUI();
  setStatus('data-status', '🗑 Current set cleared.', 'err');
}

function exportData() {
  try {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No questions available to export');
    }
    const payload = JSON.stringify(questions, null, 2);
    const activeSet = getActiveQuestionSet();
    const safeName = activeSet ? activeSet.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') : 'questions';
    const date = new Date();
    const filename = `jq_${safeName}_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.json`;
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast(`✅ Exported ${questions.length} questions to ${filename}`, 'ok');
  } catch (e) {
    showToast(`❌ Export failed: ${e.message}`, 'err');
  }
}

function loadSampleData() {
  questions = [...SAMPLE_DATA];
  dataPage = 1;
  saveToStorage();
  setStatus('data-status', `✅ Loaded ${questions.length} sample questions!`, 'ok');
  refreshDataPreview();
  updateMenuUI();
}

function getPageCount() {
  return Math.max(1, Math.ceil(questions.length / DATA_PAGE_SIZE));
}

function setDataPage(page) {
  const pageCount = getPageCount();
  dataPage = Math.min(Math.max(1, page), pageCount);
  refreshDataPreview();
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

function refreshDataPreview() {
  const preview = document.getElementById('data-preview');
  const list = document.getElementById('question-list');
  if (!list) return;

  const filteredQuestions = searchQuery
    ? questions.filter(q => {
        const text = `${q.word} ${q.q} ${q.romaji} ${q.translation || ''}`.toLowerCase();
        return text.includes(searchQuery);
      })
    : questions;

  document.getElementById('current-count').textContent = filteredQuestions.length;
  preview.innerHTML = filteredQuestions.map(q => `<span class="data-chip">${escapeHtml(q.word)}</span>`).join('');

  if (filteredQuestions.length === 0) {
    list.innerHTML = '<div class="empty-data">No matching questions found.</div>';
    return;
  }

  const pageCount = Math.max(1, Math.ceil(filteredQuestions.length / DATA_PAGE_SIZE));
  if (dataPage > pageCount) dataPage = pageCount;
  const startIndex = (dataPage - 1) * DATA_PAGE_SIZE;
  const pageItems = filteredQuestions.slice(startIndex, startIndex + DATA_PAGE_SIZE);

  let rows = '';
  pageItems.forEach((q, index) => {
    const i = startIndex + index;
    rows += `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(q.word)}</td>
        <td>${escapeHtml(q.q)}</td>
        <td>
          <button type="button" class="action-btn btn-secondary" onclick="openImportModal(${i})">Edit</button>
          <button type="button" class="action-btn btn-danger" onclick="deleteQuestion(${i})">Delete</button>
        </td>
      </tr>`;
  });

  const prevDisabled = dataPage <= 1 ? 'disabled' : '';
  const nextDisabled = dataPage >= pageCount ? 'disabled' : '';

  list.innerHTML = `
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Word</th>
            <th>Question</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <button type="button" class="page-btn" onclick="setDataPage(${dataPage - 1})" ${prevDisabled}>‹ Previous</button>
      <span class="page-info">Page ${dataPage} / ${pageCount}</span>
      <button type="button" class="page-btn" onclick="setDataPage(${dataPage + 1})" ${nextDisabled}>Next ›</button>
    </div>`;
}

function deleteQuestion(index) {
  if (index < 0 || index >= questions.length) return;
  if (!confirm('Are you sure you want to delete this question?')) return;
  questions.splice(index, 1);
  cleanupQuestionStats(index);
  saveToStorage();
  refreshDataPreview();
  updateMenuUI();
}

function updateQuestionSearch() {
  const input = document.getElementById('question-search');
  if (!input) return;
  searchQuery = input.value.trim().toLowerCase();
  dataPage = 1;
  refreshDataPreview();
}

function setStatus(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `status-msg status-${type}`;
}

/* ══════════════════════════════════════════════
   MENU UI
══════════════════════════════════════════════ */
function updateMenuUI() {
  document.getElementById('menu-hp-val').textContent = playerHP;
  document.getElementById('menu-exp-val').textContent = playerEXP;
  document.getElementById('menu-hp').style.width = `${Math.max(0, playerHP)}%`;
  document.getElementById('menu-exp').style.width = `${Math.min(100, (playerEXP % 100))}%`;
  const levelEl = document.getElementById('menu-level');
  if (levelEl) levelEl.textContent = playerLevel;
  document.getElementById('menu-combo').textContent = playerCombo;
  document.getElementById('data-count').textContent = `${questions.length} loaded questions`;
}

function normalizePlayerProgress() {
  if (playerLevel < 1) playerLevel = 1;
  if (playerHP < 0) playerHP = 0;
  if (playerEXP < 0) playerEXP = 0;

  if (playerEXP >= XP_PER_LEVEL) {
    const gainedLevels = Math.floor(playerEXP / XP_PER_LEVEL);
    playerLevel += gainedLevels;
    playerEXP = playerEXP % XP_PER_LEVEL;
  }

  if (playerHP <= 0) {
    if (playerLevel > 1) {
      playerLevel -= 1;
      playerHP = 100;
    } else {
      playerHP = 0;
    }
  }
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
function startGame(type) {
  if (questions.length === 0) {
    showToast('❌ No questions available! Please import data.', 'err');
    return;
  }
  if (type === 'quiz') startQuiz();
  if (type === 'listen') startListen();
  if (type === 'flash') startFlash();
  if (type === 'type') startTyping();
  if (type === 'match') startMatch();
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
  saveToStorage();
  document.getElementById('modal-gameover').classList.add('hidden');
  showScreen('screen-menu');
}

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


/* ══════════════════════════════════════════════
  GAME LOGIC
══════════════════════════════════════════════ */
const dictionaryGame = {
  'quiz': () => {
    restartGame(() => {
      startQuiz();
    });
  },
  'listen': () => {
    restartGame(() => {
      startListen();
    });
  },
  'flash': () => {
    restartGame(() => {
      startFlash();
    });
  },
  'type': () => {
    restartGame(() => {
      startTyping();
    });
  },
  'match': () => {
    restartGame(() => {
      startMatch();
    });
  }
}

function gameOver(score, combo, type) {
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
  document.getElementById('go-score').textContent = score;
  document.getElementById('modal-gameover').classList.remove('hidden');

  // Clone button to remove old event listeners
  const oldBtn_restart = document.getElementById("btn-restart");
  const newBtn_restart = oldBtn_restart.cloneNode(true);
  oldBtn_restart.replaceWith(newBtn_restart);

  // Add new event listener to the cloned button
  document.getElementById('btn-restart').addEventListener('click', dictionaryGame[type]);
}

function restartGame(onRestart) {
  document.getElementById('modal-gameover').classList.add('hidden');
  if (onRestart) onRestart();
}

let currentGameType = null;

function openGamePrioritySettings(gameType) {
  currentGameType = gameType;
  const modal = document.getElementById('game-priority-modal');
  const titles = { quiz: '📝 Quiz', listen: '🎧 Listening', flash: '🃏 Flashcard', match: '🧩 Match', type: '⌨ Falling Words' };
  document.getElementById('game-priority-title').textContent = `⚙️ ${titles[gameType]} Settings`;
  
  const perGame = settings.priority?.perGame?.[gameType];
  const override = perGame?.enabled === true || perGame?.enabled === 1;
  
  document.getElementById('game-priority-override').checked = override;
  document.getElementById('game-priority-weights').classList.toggle('active', override);
  
  if (override) {
    document.getElementById('game-priority-incorrect').value = perGame.incorrect ?? 5;
    document.getElementById('game-priority-time').value = perGame.timeSinceSeen ?? 3;
    document.getElementById('game-priority-learning').value = perGame.learning ?? 2;
  } else {
    document.getElementById('game-priority-incorrect').value = settings.priority?.global?.incorrect ?? 5;
    document.getElementById('game-priority-time').value = settings.priority?.global?.timeSinceSeen ?? 3;
    document.getElementById('game-priority-learning').value = settings.priority?.global?.learning ?? 2;
  }
  
  document.getElementById('game-priority-incorrect-val').textContent = document.getElementById('game-priority-incorrect').value;
  document.getElementById('game-priority-time-val').textContent = document.getElementById('game-priority-time').value;
  document.getElementById('game-priority-learning-val').textContent = document.getElementById('game-priority-learning').value;
  
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
      learning: parseInt(document.getElementById('game-priority-learning').value, 10)
    };
  } else {
    settings.priority.perGame[currentGameType] = { enabled: null, incorrect: 5, timeSinceSeen: 3, learning: 2 };
  }
  
  saveSettingsToStorage();
}