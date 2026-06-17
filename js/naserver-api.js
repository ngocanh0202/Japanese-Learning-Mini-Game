// Optional NAServer sync. Local storage remains the source of truth unless configured.
const NASERVER_CONFIG_KEY = 'jq_naserver_config';
const NASERVER_DEFAULT_BASE_URL = 'http://127.0.0.1:8000';
let naserverAuthMode = 'login';
let naserverSyncBusy = false;
let naserverGameSessionId = null;
let naserverGameState = null;

function normalizeNAServerConfig(config = {}) {
  return {
    provider: 'naserver',
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
  hydrateNAServerConfigUI();
  return normalized;
}

function getNAServerBaseUrl(config = loadNAServerConfig()) {
  return (config.baseUrl || '').replace(/\/+$/, '');
}

function isNAServerConfigured(config = loadNAServerConfig()) {
  return !!(getNAServerBaseUrl(config) && config.token);
}

function isNAServerBusy() {
  return naserverSyncBusy;
}

function canPushActiveLocalSet() {
  const activeSet = typeof getActiveQuestionSet === 'function'
    ? getActiveQuestionSet()
    : (typeof questionSets !== 'undefined' && Array.isArray(questionSets)
      ? questionSets.find(set => set.id === activeSetId)
      : null);
  return !!activeSet && !activeSet.serverId && !activeSet.serverOnly;
}

function canPullActiveServerSet() {
  if (!isNAServerConfigured()) return false;
  const activeSet = typeof getActiveQuestionSet === 'function'
    ? getActiveQuestionSet()
    : (typeof questionSets !== 'undefined' && Array.isArray(questionSets)
      ? questionSets.find(set => set.id === activeSetId)
      : null);
  return !!activeSet && !!(activeSet.serverId || activeSet.serverOnly);
}

function setProviderMode(provider) {
  const current = loadNAServerConfig();
  const next = saveNAServerConfig({ ...current, provider: 'naserver' });
  updateProviderModeUI(next);
  return next;
}

function getNAServerHeaders(config = loadNAServerConfig()) {
  const headers = { 'Content-Type': 'application/json' };
  if (config.token) headers.Authorization = `Bearer ${config.token}`;
  return headers;
}

function isNAServerAuthError(response, detail) {
  return (
    response.status === 401 ||
    detail === 'Invalid authentication credentials' ||
    detail === 'Invalid app token' ||
    detail === 'Token expired'
  );
}

function clearNAServerSession(config = loadNAServerConfig()) {
  saveNAServerConfig({
    ...config,
    token: '',
    email: '',
    provider: 'naserver'
  });
}

async function requestNAServer(path, options = {}) {
  const config = loadNAServerConfig();
  const baseUrl = getNAServerBaseUrl(config);
  if (!baseUrl || !config.token) {
    throw new Error('Please login to NAServer first');
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers: getNAServerHeaders(config),
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (isNAServerAuthError(response, payload.detail)) {
      clearNAServerSession(config);
      throw new Error('NAServer session expired. Please login again.');
    }
    if (response.status === 409) {
      throw new Error(getConflictMessage());
    }
    throw new Error(payload.detail || `NAServer request failed with status ${response.status}`);
  }
  return payload;
}

function hydrateNAServerConfigUI() {
  const config = loadNAServerConfig();
  const providerSelect = document.getElementById('storage-provider-mode');
  const emailInput = document.getElementById('naserver-email');
  const passwordInput = document.getElementById('naserver-password');
  const passwordConfirmInput = document.getElementById('naserver-password-confirm');
  const status = document.getElementById('naserver-account-status');
  const loginOpenBtn = document.getElementById('btn-naserver-login-open');
  const registerOpenBtn = document.getElementById('btn-naserver-register-open');
  const logoutBtn = document.getElementById('btn-naserver-logout');
  const pullBtn = document.getElementById('btn-pull-active');
  const pushBtn = document.getElementById('btn-push-active');
  if (providerSelect) providerSelect.value = 'NAServer';
  if (emailInput) emailInput.value = config.email || '';
  if (passwordInput) passwordInput.value = '';
  if (passwordConfirmInput) passwordConfirmInput.value = '';
  if (status) {
    status.textContent = config.token ? `Logged in as ${config.email || 'NAServer user'}` : 'Not logged in';
  }
  setHidden(loginOpenBtn, !!config.token);
  setHidden(registerOpenBtn, !!config.token);
  setHidden(logoutBtn, !config.token);
  setHidden(pullBtn, !canPullActiveServerSet());
  setHidden(pushBtn, !isNAServerConfigured(config) || !canPushActiveLocalSet());
  updateNAServerBusyUI();
  updateProviderModeUI(config);
}

function saveNAServerConfigFromUI() {
  const providerSelect = document.getElementById('storage-provider-mode');
  setProviderMode(providerSelect ? providerSelect.value : 'naserver');
  showToast('Server mode saved', 'ok');
}

function updateProviderModeUI(config = loadNAServerConfig()) {
  const naserverPanel = document.getElementById('naserver-auth-panel');
  const pullBtn = document.getElementById('btn-pull-active');
  const pushBtn = document.getElementById('btn-push-active');
  if (naserverPanel) setHidden(naserverPanel, false);
  setHidden(pullBtn, !canPullActiveServerSet());
  setHidden(pushBtn, !isNAServerConfigured(config) || !canPushActiveLocalSet());
  updateNAServerBusyUI();
}

function updateNAServerBusyUI() {
  const overlay = document.getElementById('naserver-backup-overlay');
  const pullBtn = document.getElementById('btn-pull-active');
  const pushBtn = document.getElementById('btn-push-active');
  const gameButtons = document.querySelectorAll ? document.querySelectorAll('.menu-btn') : [];
  if (overlay) setHidden(overlay, !naserverSyncBusy);
  setHidden(pullBtn, naserverSyncBusy || !canPullActiveServerSet());
  setHidden(pushBtn, naserverSyncBusy || !isNAServerConfigured() || !canPushActiveLocalSet());
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
    await refreshQuestionSetsFromNAServer({ replaceLocal: true });
  } catch (error) {
    showToast(`Logged in, failed to load server sets: ${error.message}`, 'err');
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
  naserverGameSessionId = null;
  naserverGameState = null;
  if (typeof resetQuestionSetsToDefaultExample === 'function') {
    resetQuestionSetsToDefaultExample();
  } else {
    const now = new Date().toISOString();
    questionSets = [{
      id: 'set-default',
      name: 'Default Set',
      questions: [...(typeof SAMPLE_DATA !== 'undefined' ? SAMPLE_DATA : [])],
      createdAt: now,
      updatedAt: now
    }];
    activeSetId = questionSets[0].id;
    questions = questionSets[0].questions;
    saveQuestionSetsToStorage();
  }
  refreshQuestionSetUI();
  refreshDataPreview();
  updateMenuUI();
  showToast('Logged out from NAServer', 'ok');
}

function openNAServerAuthModal(mode = 'login') {
  naserverAuthMode = mode === 'register' ? 'register' : 'login';
  const modal = document.getElementById('naserver-auth-modal');
  const title = document.getElementById('naserver-auth-modal-title');
  const submit = document.getElementById('naserver-auth-submit');
  const confirmGroup = document.getElementById('naserver-password-confirm-group');
  const config = loadNAServerConfig();
  const emailInput = document.getElementById('naserver-email');
  const passwordInput = document.getElementById('naserver-password');
  const passwordConfirmInput = document.getElementById('naserver-password-confirm');
  if (emailInput) emailInput.value = config.email || '';
  if (passwordInput) passwordInput.value = '';
  if (passwordConfirmInput) passwordConfirmInput.value = '';
  if (title) title.textContent = naserverAuthMode === 'register' ? 'NAServer register' : 'NAServer login';
  if (submit) submit.textContent = naserverAuthMode === 'register' ? 'Register' : 'Login';
  setHidden(confirmGroup, naserverAuthMode !== 'register');
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
  const passwordConfirm = document.getElementById('naserver-password-confirm')?.value;
  if (!email || !password) {
    showToast('Email and password are required', 'err');
    return;
  }
  if (password !== passwordConfirm) {
    showToast('Passwords do not match', 'err');
    return;
  }
  try {
    await registerNAServerAccount(email, password);
    showToast('Registration submitted. Account is pending admin approval.', 'ok');
    closeNAServerAuthModal();
  } catch (error) {
    showToast(`NAServer registration failed: ${error.message}`, 'err');
  }
}

async function pullActiveSetFromNAServer() {
  const confirmed = await showConfirmDialog({
    title: 'Pull NAServer question sets',
    message: 'Pulling from NAServer will replace all current question sets, including local sets that have not been pushed. Continue?',
    confirmText: 'Pull sets'
  });
  if (!confirmed) return;
  try {
    await refreshQuestionSetsFromNAServer({ replaceLocal: true });
    showToast('Loaded NAServer question sets', 'ok');
  } catch (error) {
    showToast(`NAServer pull failed: ${error.message}`, 'err');
  }
}

async function pushActiveSetToNAServer() {
  await backupActiveSetToNAServer();
}

async function loadSettingsFromNAServer() {
  return requestNAServer('/api/japanese-learning-game/settings');
}

async function saveSettingsToNAServer(nextSettings) {
  return requestNAServer('/api/japanese-learning-game/settings', {
    method: 'PUT',
    body: nextSettings
  });
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

function getQuestionSetByLocalOrServerId(localOrServerId) {
  return questionSets.find(item => item.id === localOrServerId || item.serverId === localOrServerId);
}

function getServerIdFromSetRef(localOrServerId) {
  const set = getQuestionSetByLocalOrServerId(localOrServerId);
  return set?.serverId || String(localOrServerId || '').replace(/^server-/, '');
}

function getExpectedUpdatedAt(localOrServerId) {
  const set = getQuestionSetByLocalOrServerId(localOrServerId);
  return set?.updatedAt || '';
}

function withExpectedUpdatedAt(localOrServerId, body = {}) {
  const expected = getExpectedUpdatedAt(localOrServerId);
  return expected ? { ...body, expected_updated_at: expected } : body;
}

function getConflictMessage() {
  return 'Data on server has changed. Please pull latest before editing/deleting.';
}

function mergeServerQuestionSets(serverSets) {
  const serverIds = new Set(serverSets.map(set => set.serverId));
  const localSets = questionSets.filter(set => !set.serverOnly && !set.serverId);
  const pushedLocalSets = questionSets.filter(set => set.serverId && !set.serverOnly && !serverIds.has(set.serverId));
  return [
    ...localSets,
    ...pushedLocalSets,
    ...serverSets
  ];
}

async function refreshQuestionSetsFromNAServer(options = {}) {
  const sets = await requestNAServer('/api/japanese-learning-game/sets');
  const normalized = Array.isArray(sets) ? sets.map(normalizeServerQuestionSetMeta) : [];
  const previousActiveId = activeSetId;
  questionSets = normalized;
  const preferredActive = options.preferredId ? questionSets.find(set => set.id === options.preferredId || set.serverId === options.preferredId) : null;
  const activeStillExists = questionSets.find(set => set.id === previousActiveId);
  const serverActive = normalized.find(set => set.isActive);
  const active = preferredActive || activeStillExists || serverActive || questionSets[0] || null;
  activeSetId = active ? active.id : null;
  if (typeof syncQuestionsFromActiveSet === 'function') {
    syncQuestionsFromActiveSet();
  } else {
    questions = active && !active.serverOnly ? (active.questions || []) : [];
  }
  saveQuestionSetsToStorage();
  refreshQuestionSetUI();
  refreshDataPreview();
  updateMenuUI();
  return normalized;
}

async function setActiveQuestionSetOnNAServer(localOrServerId) {
  const set = getQuestionSetByLocalOrServerId(localOrServerId);
  const serverId = getServerIdFromSetRef(localOrServerId);
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

async function loadQuestionSetPageFromNAServer(localOrServerId, page = 1, pageSize = 4) {
  const serverId = getServerIdFromSetRef(localOrServerId);
  if (!serverId) throw new Error('No NAServer question set selected');
  const query = arguments.length >= 4 ? String(arguments[3] || '').trim() : '';
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize)
  });
  if (query) params.set('q', query);
  return requestNAServer(`/api/japanese-learning-game/sets/${encodeURIComponent(serverId)}?${params.toString()}`);
}

async function updateQuestionOnNAServer(localOrServerId, questionId, question) {
  const serverId = getServerIdFromSetRef(localOrServerId);
  if (!serverId) throw new Error('No NAServer question set selected');
  if (!questionId) throw new Error('No NAServer question selected');
  return requestNAServer(`/api/japanese-learning-game/sets/${encodeURIComponent(serverId)}/questions/${encodeURIComponent(questionId)}`, {
    method: 'PUT',
    body: withExpectedUpdatedAt(localOrServerId, question)
  });
}

async function addQuestionOnNAServer(localOrServerId, question) {
  const serverId = getServerIdFromSetRef(localOrServerId);
  if (!serverId) throw new Error('No NAServer question set selected');
  return requestNAServer(`/api/japanese-learning-game/sets/${encodeURIComponent(serverId)}/questions`, {
    method: 'POST',
    body: question
  });
}

async function deleteQuestionOnNAServer(localOrServerId, questionId) {
  const serverId = getServerIdFromSetRef(localOrServerId);
  if (!serverId) throw new Error('No NAServer question set selected');
  if (!questionId) throw new Error('No NAServer question selected');
  const params = new URLSearchParams();
  const expected = getExpectedUpdatedAt(localOrServerId);
  if (expected) params.set('expected_updated_at', expected);
  const query = params.toString() ? `?${params.toString()}` : '';
  return requestNAServer(`/api/japanese-learning-game/sets/${encodeURIComponent(serverId)}/questions/${encodeURIComponent(questionId)}${query}`, {
    method: 'DELETE'
  });
}

async function searchJapaneseGameUsersOnNAServer(query = '', page = 1, pageSize = 20) {
  const params = new URLSearchParams({
    q: String(query || '').trim(),
    page: String(page),
    page_size: String(pageSize)
  });
  return requestNAServer(`/api/japanese-learning-game/users?${params.toString()}`);
}

function syncNAServerGamePayload(data) {
  naserverGameSessionId = data.session_id || naserverGameSessionId || null;
  naserverGameState = data.state || data || null;
  const currentQuestion = naserverGameState?.current_question || data.current_question || null;
  if (currentQuestion) {
    questions = [currentQuestion];
  } else if (Array.isArray(data.questions)) {
    questions = data.questions;
  } else {
    questions = [];
  }
  initQuestionStats(questions);
  refreshQuestionSetUI();
  updateMenuUI();
  return data;
}

async function startServerGame(gameType) {
  naserverGameSessionId = null;
  naserverGameState = null;
  const data = await requestNAServer('/api/japanese-learning-game/start', {
    method: 'POST',
    body: { game_type: gameType }
  });
  syncNAServerGamePayload(data);
  await loadQuestionStatsFromNAServer();
  return data;
}

async function resumeServerGame(gameType) {
  const data = await requestNAServer(`/api/japanese-learning-game/session?game_type=${encodeURIComponent(gameType)}`);
  syncNAServerGamePayload(data);
  return data;
}

async function submitGameAnswerOnNAServer(questionId, answerIndex, responseTime, gameType = '') {
  if (!naserverGameSessionId) throw new Error('No active NAServer game session');
  try {
    const result = await requestNAServer(`/api/japanese-learning-game/answer?session_id=${encodeURIComponent(naserverGameSessionId)}`, {
      method: 'POST',
      body: {
        question_id: String(questionId).includes('::') ? String(questionId).split('::').pop() : questionId,
        answer_index: answerIndex,
        response_time_ms: Number.isFinite(responseTime) ? Math.max(0, Math.round(responseTime)) : 0
      }
    });
    naserverGameState = result.state || result || naserverGameState;
    return result;
  } catch (error) {
    if (gameType && isNAServerNotFoundError(error)) {
      const data = await resumeServerGame(gameType);
      return {
        ...(data.state || data),
        state: data.state || data,
        sync_required: true,
        reason: 'session_not_found'
      };
    }
    throw error;
  }
}

function isNAServerNotFoundError(error) {
  return /not found|session not found|no active session/i.test(error?.message || '');
}

async function nextServerGameQuestion(gameType = '') {
  if (!naserverGameSessionId) throw new Error('No active NAServer game session');
  try {
    const data = await requestNAServer(`/api/japanese-learning-game/next?session_id=${encodeURIComponent(naserverGameSessionId)}`, {
      method: 'POST'
    });
    syncNAServerGamePayload(data);
    return data;
  } catch (error) {
    if (gameType && isNAServerNotFoundError(error)) {
      return resumeServerGame(gameType);
    }
    throw error;
  }
}

function isNAServerGameSessionActive() {
  return !!naserverGameSessionId;
}

function getNAServerGameState() {
  return naserverGameState;
}

async function loadQuestionStatsFromNAServer() {
  questionStats = await requestNAServer('/api/japanese-learning-game/questions');
  return questionStats;
}

async function loadLearningStatsFromNAServer() {
  return requestNAServer('/api/japanese-learning-game/overview');
}

async function recordAttemptOnNAServer(questionId, gameType, correct, responseTime) {
  const responseTimeMs = Number.isFinite(responseTime) ? Math.max(0, Math.round(responseTime)) : null;
  const payload = await requestNAServer('/api/japanese-learning-game/attempt', {
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
  const set = getQuestionSetByLocalOrServerId(localId);
  if (!set?.serverId) throw new Error('No NAServer question set selected');
  const fullSet = await requestNAServer(`/api/japanese-learning-game/sets/${encodeURIComponent(set.serverId)}`);
  await requestNAServer(`/api/japanese-learning-game/sets/${encodeURIComponent(set.serverId)}`, {
    method: 'PUT',
    body: withExpectedUpdatedAt(localId, {
      name,
      questions: Array.isArray(fullSet.questions) ? fullSet.questions : []
    })
  });
  await refreshQuestionSetsFromNAServer({ preferredId: set.id });
}

async function deleteQuestionSetOnNAServer(localId) {
  const set = getQuestionSetByLocalOrServerId(localId);
  if (!set?.serverId) throw new Error('No NAServer question set selected');
  const params = new URLSearchParams();
  const expected = getExpectedUpdatedAt(localId);
  if (expected) params.set('expected_updated_at', expected);
  const query = params.toString() ? `?${params.toString()}` : '';
  await requestNAServer(`/api/japanese-learning-game/sets/${encodeURIComponent(set.serverId)}${query}`, {
    method: 'DELETE'
  });
  await refreshQuestionSetsFromNAServer();
}

async function shareQuestionSetOnNAServer(localId, email, permission = 'view', userId = '') {
  const set = questionSets.find(item => item.id === localId || item.serverId === localId);
  if (!set?.serverId) throw new Error('No NAServer question set selected');
  const body = { permission };
  if (userId) {
    body.user_id = userId;
  } else {
    body.email = email;
  }
  await requestNAServer(`/api/japanese-learning-game/sets/${encodeURIComponent(set.serverId)}/share`, {
    method: 'POST',
    body
  });
  await refreshQuestionSetsFromNAServer({ preferredId: set.id });
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
        body: withExpectedUpdatedAt(activeSet.id, body)
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
    await refreshQuestionSetsFromNAServer({ preferredId: saved.id });
    setNAServerProgress('Backup complete', 100);
    if (!options.silent) showToast('Pushed active set to NAServer', 'ok');
  } catch (error) {
    showToast(`NAServer push failed: ${error.message}`, 'err');
    throw error;
  } finally {
    setTimeout(() => setNAServerBusy(false), 250);
  }
}
