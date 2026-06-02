// Optional NAServer sync. Local storage remains the source of truth unless configured.
const NASERVER_CONFIG_KEY = 'jq_naserver_config';
const NASERVER_DEFAULT_BASE_URL = 'http://127.0.0.1:8000';
let naserverAuthMode = 'login';
let naserverSyncBusy = false;

function normalizeNAServerConfig(config = {}) {
  const provider = config.provider === 'firebase' ? 'firebase' : 'naserver';
  return {
    provider,
    baseUrl: (config.baseUrl || NASERVER_DEFAULT_BASE_URL).trim(),
    token: (config.token || '').trim(),
    email: (config.email || '').trim()
  };
}

function loadNAServerConfig() {
  try {
    const raw = localStorage.getItem(NASERVER_CONFIG_KEY);
    return normalizeNAServerConfig(raw ? JSON.parse(raw) : {});
  } catch (_) {
    return normalizeNAServerConfig();
  }
}

function saveNAServerConfig(config) {
  const normalized = normalizeNAServerConfig(config);
  localStorage.setItem(NASERVER_CONFIG_KEY, JSON.stringify(normalized));
  if (normalized.provider === 'naserver' && normalized.token) {
    localStorage.removeItem('jq_firebase_config');
    if (typeof showFirebaseSetsButton === 'function') showFirebaseSetsButton(false);
  }
  hydrateNAServerConfigUI();
  return normalized;
}

function getNAServerBaseUrl(config = loadNAServerConfig()) {
  return (config.baseUrl || '').replace(/\/+$/, '');
}

function isNAServerConfigured(config = loadNAServerConfig()) {
  return config.provider !== 'firebase' && !!(getNAServerBaseUrl(config) && config.token);
}

function isNAServerBusy() {
  return naserverSyncBusy;
}

function isFirebaseProviderMode(config = loadNAServerConfig()) {
  return config.provider === 'firebase';
}

function setProviderMode(provider) {
  const current = loadNAServerConfig();
  const next = saveNAServerConfig({ ...current, provider: provider === 'firebase' ? 'firebase' : 'naserver' });
  updateProviderModeUI(next);
  return next;
}

function getNAServerHeaders(config = loadNAServerConfig()) {
  const headers = { 'Content-Type': 'application/json' };
  if (config.token) headers.Authorization = `Bearer ${config.token}`;
  return headers;
}

async function requestNAServer(path, options = {}) {
  const config = loadNAServerConfig();
  const baseUrl = getNAServerBaseUrl(config);
  if (config.provider === 'firebase' || !baseUrl || !config.token) {
    throw new Error('Please login to NAServer first');
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers: getNAServerHeaders(config),
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || `NAServer request failed with status ${response.status}`);
  }
  return payload;
}

function hydrateNAServerConfigUI() {
  const config = loadNAServerConfig();
  const providerSelect = document.getElementById('storage-provider-mode');
  const emailInput = document.getElementById('naserver-email');
  const passwordInput = document.getElementById('naserver-password');
  const status = document.getElementById('naserver-account-status');
  const loginOpenBtn = document.getElementById('btn-naserver-login-open');
  const registerOpenBtn = document.getElementById('btn-naserver-register-open');
  const logoutBtn = document.getElementById('btn-naserver-logout');
  const syncActions = document.getElementById('naserver-sync-actions');
  if (providerSelect) providerSelect.value = config.provider;
  if (emailInput) emailInput.value = config.email || '';
  if (passwordInput) passwordInput.value = '';
  if (status) {
    status.textContent = config.token ? `Logged in as ${config.email || 'NAServer user'}` : 'Not logged in';
  }
  setHidden(loginOpenBtn, !!config.token || config.provider === 'firebase');
  setHidden(registerOpenBtn, !!config.token || config.provider === 'firebase');
  setHidden(logoutBtn, !config.token || config.provider === 'firebase');
  setHidden(syncActions, !isNAServerConfigured(config));
  updateNAServerBusyUI();
  updateProviderModeUI(config);
}

function saveNAServerConfigFromUI() {
  const providerSelect = document.getElementById('storage-provider-mode');
  setProviderMode(providerSelect ? providerSelect.value : 'naserver');
  showToast('Server mode saved', 'ok');
}

function updateProviderModeUI(config = loadNAServerConfig()) {
  const firebaseSections = document.querySelectorAll ? document.querySelectorAll('[data-provider-section="firebase"]') : [];
  const naserverPanel = document.getElementById('naserver-auth-panel');
  const syncActions = document.getElementById('naserver-sync-actions');
  const showFirebase = config.provider === 'firebase';
  firebaseSections.forEach(section => setHidden(section, !showFirebase));
  if (naserverPanel) setHidden(naserverPanel, showFirebase);
  if (syncActions) setHidden(syncActions, !isNAServerConfigured(config));
  updateNAServerBusyUI();
  if (typeof showFirebaseSetsButton === 'function') {
    showFirebaseSetsButton(showFirebase && !!localStorage.getItem('jq_firebase_config'));
  }
}

function updateNAServerBusyUI() {
  const overlay = document.getElementById('naserver-backup-overlay');
  const syncActions = document.getElementById('naserver-sync-actions');
  const gameButtons = document.querySelectorAll ? document.querySelectorAll('.menu-btn') : [];
  if (overlay) setHidden(overlay, !naserverSyncBusy);
  if (syncActions) setHidden(syncActions, naserverSyncBusy || !isNAServerConfigured());
  gameButtons.forEach(btn => {
    btn.disabled = naserverSyncBusy;
    btn.classList.toggle('is-disabled', naserverSyncBusy);
  });
}

function setNAServerBusy(busy, label = 'Syncing with NAServer...', percent = 0) {
  naserverSyncBusy = !!busy;
  const labelEl = document.getElementById('naserver-backup-label');
  const fillEl = document.getElementById('naserver-backup-fill');
  const percentEl = document.getElementById('naserver-backup-percent');
  const trackEl = document.querySelector ? document.querySelector('.naserver-backup-track') : null;
  const nextPercent = naserverSyncBusy ? Math.max(0, Math.min(100, percent)) : 0;
  if (labelEl) labelEl.textContent = label;
  if (fillEl) fillEl.style.width = `${nextPercent}%`;
  if (percentEl) percentEl.textContent = `${Math.round(nextPercent)}%`;
  if (trackEl) {
    trackEl.setAttribute('role', 'progressbar');
    trackEl.setAttribute('aria-valuemin', '0');
    trackEl.setAttribute('aria-valuemax', '100');
    trackEl.setAttribute('aria-valuenow', String(Math.round(nextPercent)));
  }
  updateNAServerBusyUI();
}

function setNAServerProgress(label, percent) {
  setNAServerBusy(true, label, percent);
}

function setHidden(element, hidden) {
  if (!element || !element.classList) return;
  if (typeof element.classList.toggle === 'function') {
    element.classList.toggle('hidden', hidden);
  } else if (hidden && typeof element.classList.add === 'function') {
    element.classList.add('hidden');
  } else if (!hidden && typeof element.classList.remove === 'function') {
    element.classList.remove('hidden');
  }
}

async function authNAServerAccount(path, email, password) {
  const current = loadNAServerConfig();
  const baseUrl = getNAServerBaseUrl(current);
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || `NAServer auth failed with status ${response.status}`);
  }
  return payload;
}

async function loginNAServerAccount(email, password) {
  const payload = await authNAServerAccount('/api/japanese-learning-game/auth/login', email, password);
  saveNAServerConfig({
    ...loadNAServerConfig(),
    provider: 'naserver',
    token: payload.access_token || '',
    email
  });
  try {
    await backupActiveSetToNAServer({ silent: true });
  } catch (error) {
    showToast(`Logged in, backup failed: ${error.message}`, 'err');
  }
  showToast('Logged in to NAServer', 'ok');
  return payload;
}

async function registerNAServerAccount(email, password) {
  const payload = await authNAServerAccount('/api/japanese-learning-game/auth/register', email, password);
  showToast(`Registered ${payload.email || email}. Status: ${payload.approval_status || 'pending'}`, 'ok');
  return payload;
}

function logoutNAServerAccount() {
  saveNAServerConfig({ ...loadNAServerConfig(), token: '', email: '', provider: 'naserver' });
  showToast('Logged out from NAServer', 'ok');
}

function openNAServerAuthModal(mode = 'login') {
  naserverAuthMode = mode === 'register' ? 'register' : 'login';
  const modal = document.getElementById('naserver-auth-modal');
  const title = document.getElementById('naserver-auth-modal-title');
  const submit = document.getElementById('naserver-auth-submit');
  const config = loadNAServerConfig();
  const emailInput = document.getElementById('naserver-email');
  const passwordInput = document.getElementById('naserver-password');
  if (emailInput) emailInput.value = config.email || '';
  if (passwordInput) passwordInput.value = '';
  if (title) title.textContent = naserverAuthMode === 'register' ? 'NAServer register' : 'NAServer login';
  if (submit) submit.textContent = naserverAuthMode === 'register' ? 'Register' : 'Login';
  if (modal) modal.classList.remove('hidden');
}

function closeNAServerAuthModal() {
  const modal = document.getElementById('naserver-auth-modal');
  if (modal) modal.classList.add('hidden');
}

async function submitNAServerAuthModal() {
  if (naserverAuthMode === 'register') {
    await registerNAServerFromUI();
  } else {
    await loginNAServerFromUI();
  }
}

async function loginNAServerFromUI() {
  const email = document.getElementById('naserver-email')?.value.trim();
  const password = document.getElementById('naserver-password')?.value;
  if (!email || !password) {
    showToast('Email and password are required', 'err');
    return;
  }
  try {
    await loginNAServerAccount(email, password);
    closeNAServerAuthModal();
  } catch (error) {
    showToast(`NAServer login failed: ${error.message}`, 'err');
  }
}

async function registerNAServerFromUI() {
  const email = document.getElementById('naserver-email')?.value.trim();
  const password = document.getElementById('naserver-password')?.value;
  if (!email || !password) {
    showToast('Email and password are required', 'err');
    return;
  }
  try {
    await registerNAServerAccount(email, password);
    closeNAServerAuthModal();
  } catch (error) {
    showToast(`NAServer registration failed: ${error.message}`, 'err');
  }
}

async function pullActiveSetFromNAServer() {
  try {
    await refreshQuestionSetsFromNAServer();
    showToast('Loaded NAServer question sets', 'ok');
  } catch (error) {
    showToast(`NAServer pull failed: ${error.message}`, 'err');
  }
}

async function pushActiveSetToNAServer() {
  await backupActiveSetToNAServer();
}

function normalizeServerQuestionSetMeta(data) {
  const id = data.id || data.serverId;
  const now = new Date().toISOString();
  return {
    id: `server-${id}`,
    serverId: id,
    name: data.name || 'NAServer Set',
    question_count: data.question_count ?? data.questionCount ?? 0,
    questions: [],
    serverOnly: true,
    isActive: !!data.is_active,
    permission: data.permission || 'view',
    canEdit: !!data.can_edit,
    canDelete: !!data.can_delete,
    canShare: !!data.can_share,
    createdAt: data.created_at || now,
    updatedAt: data.updated_at || now
  };
}

async function refreshQuestionSetsFromNAServer() {
  const sets = await requestNAServer('/api/japanese-learning-game/sets');
  const normalized = Array.isArray(sets) ? sets.map(normalizeServerQuestionSetMeta) : [];
  if (normalized.length === 0) return [];

  questionSets = normalized;
  const active = normalized.find(set => set.isActive) || normalized[0];
  activeSetId = active.id;
  questions = [];
  saveQuestionSetsToStorage();
  refreshQuestionSetUI();
  refreshDataPreview();
  updateMenuUI();
  return normalized;
}

async function setActiveQuestionSetOnNAServer(localOrServerId) {
  const set = questionSets.find(item => item.id === localOrServerId || item.serverId === localOrServerId);
  const serverId = set?.serverId || String(localOrServerId || '').replace(/^server-/, '');
  if (!serverId) throw new Error('No NAServer question set selected');
  await requestNAServer(`/api/japanese-learning-game/active-set?set_id=${encodeURIComponent(serverId)}`, {
    method: 'POST'
  });
  questionSets.forEach(item => { item.isActive = item.serverId === serverId; });
  activeSetId = set?.id || `server-${serverId}`;
  saveQuestionSetsToStorage();
  refreshQuestionSetUI();
}

async function loadActiveSetFromNAServer() {
  const data = await requestNAServer('/api/japanese-learning-game/active-set');
  const meta = normalizeServerQuestionSetMeta(data);
  const existing = questionSets.find(set => set.serverId === data.id);
  if (existing) {
    Object.assign(existing, meta);
  } else {
    questionSets.push(meta);
  }
  activeSetId = meta.id;
  questions = Array.isArray(data.questions) ? data.questions : [];
  initQuestionStats(questions);
  saveQuestionSetsToStorage();
  refreshQuestionSetUI();
  updateMenuUI();
  return data;
}

async function startServerGame(gameType) {
  const data = await requestNAServer('/api/japanese-learning-game/game/start', {
    method: 'POST',
    body: { game_type: gameType }
  });
  questions = Array.isArray(data.questions) ? data.questions : [];
  initQuestionStats(questions);
  await loadQuestionStatsFromNAServer();
  refreshQuestionSetUI();
  updateMenuUI();
  return data;
}

async function loadQuestionStatsFromNAServer() {
  questionStats = await requestNAServer('/api/japanese-learning-game/stats/questions');
  return questionStats;
}

async function recordAttemptOnNAServer(questionId, gameType, correct, responseTime) {
  const responseTimeMs = Number.isFinite(responseTime) ? Math.max(0, Math.round(responseTime)) : null;
  const payload = await requestNAServer('/api/japanese-learning-game/stats/attempt', {
    method: 'POST',
    body: {
      question_id: String(questionId).includes('::') ? String(questionId).split('::').pop() : questionId,
      game_type: gameType,
      correct: !!correct,
      response_time_ms: responseTimeMs,
      fast_correct: !!correct && responseTimeMs !== null && responseTimeMs <= getFastCorrectThresholdMs()
    }
  });
  if (payload?.question_id && payload?.game_type && payload?.stats) {
    const scopedId = getScopedQuestionId(payload.question_id);
    if (!questionStats[scopedId]) questionStats[scopedId] = {};
    questionStats[scopedId][payload.game_type] = payload.stats;
  }
  return payload;
}

async function renameQuestionSetOnNAServer(localId, name) {
  const set = questionSets.find(item => item.id === localId || item.serverId === localId);
  if (!set?.serverId) throw new Error('No NAServer question set selected');
  const fullSet = await requestNAServer(`/api/japanese-learning-game/sets/${encodeURIComponent(set.serverId)}`);
  await requestNAServer(`/api/japanese-learning-game/sets/${encodeURIComponent(set.serverId)}`, {
    method: 'PUT',
    body: {
      name,
      questions: Array.isArray(fullSet.questions) ? fullSet.questions : []
    }
  });
  await refreshQuestionSetsFromNAServer();
}

async function deleteQuestionSetOnNAServer(localId) {
  const set = questionSets.find(item => item.id === localId || item.serverId === localId);
  if (!set?.serverId) throw new Error('No NAServer question set selected');
  await requestNAServer(`/api/japanese-learning-game/sets/${encodeURIComponent(set.serverId)}`, {
    method: 'DELETE'
  });
  await refreshQuestionSetsFromNAServer();
}

async function shareQuestionSetOnNAServer(localId, email, permission = 'view') {
  const set = questionSets.find(item => item.id === localId || item.serverId === localId);
  if (!set?.serverId) throw new Error('No NAServer question set selected');
  await requestNAServer(`/api/japanese-learning-game/sets/${encodeURIComponent(set.serverId)}/share`, {
    method: 'POST',
    body: { email, permission }
  });
  await refreshQuestionSetsFromNAServer();
}

async function backupActiveSetToNAServer(options = {}) {
  const activeSet = getActiveQuestionSet();
  if (!activeSet) {
    showToast('No active question set to push', 'err');
    return;
  }

  try {
    setNAServerProgress('Preparing question set backup...', 8);
    updateActiveSetFromQuestions();
    const body = {
      name: activeSet.name || 'Untitled Set',
      questions: Array.isArray(activeSet.questions) ? activeSet.questions : []
    };
    if (!body.questions.length && Array.isArray(questions) && questions.length > 0) {
      body.questions = questions;
    }
    if (!body.questions.length) {
      throw new Error('Cannot backup empty question set');
    }

    let saved;
    if (activeSet.serverId) {
      setNAServerProgress('Updating existing NAServer set...', 35);
      await requestNAServer(`/api/japanese-learning-game/sets/${encodeURIComponent(activeSet.serverId)}`, {
        method: 'PUT',
        body
      });
      saved = { id: activeSet.serverId };
    } else {
      setNAServerProgress('Creating NAServer question set...', 35);
      saved = await requestNAServer('/api/japanese-learning-game/sets', {
        method: 'POST',
        body
      });
      activeSet.serverId = saved.id;
    }
    setNAServerProgress('Selecting active server set...', 70);
    await requestNAServer(`/api/japanese-learning-game/active-set?set_id=${encodeURIComponent(saved.id)}`, {
      method: 'POST'
    });
    setNAServerProgress('Refreshing server question sets...', 88);
    activeSet.updatedAt = new Date().toISOString();
    await refreshQuestionSetsFromNAServer();
    setNAServerProgress('Backup complete', 100);
    if (!options.silent) showToast('Pushed active set to NAServer', 'ok');
  } catch (error) {
    showToast(`NAServer push failed: ${error.message}`, 'err');
    throw error;
  } finally {
    setTimeout(() => setNAServerBusy(false), 250);
  }
}
