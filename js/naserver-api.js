// Optional NAServer sync. Local storage remains the source of truth unless configured.
const NASERVER_CONFIG_KEY = 'jq_naserver_config';
const NASERVER_DEFAULT_BASE_URL = 'http://127.0.0.1:8000';

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
  if (providerSelect) providerSelect.value = config.provider;
  if (emailInput) emailInput.value = config.email || '';
  if (passwordInput) passwordInput.value = '';
  if (status) {
    status.textContent = config.token ? `Logged in as ${config.email || 'NAServer user'}` : 'Not logged in';
  }
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
  const showFirebase = config.provider === 'firebase';
  firebaseSections.forEach(section => setHidden(section, !showFirebase));
  if (naserverPanel) setHidden(naserverPanel, showFirebase);
  if (typeof showFirebaseSetsButton === 'function') {
    showFirebaseSetsButton(showFirebase && !!localStorage.getItem('jq_firebase_config'));
  }
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

async function loginNAServerFromUI() {
  const email = document.getElementById('naserver-email')?.value.trim();
  const password = document.getElementById('naserver-password')?.value;
  if (!email || !password) {
    showToast('Email and password are required', 'err');
    return;
  }
  try {
    await loginNAServerAccount(email, password);
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
  } catch (error) {
    showToast(`NAServer registration failed: ${error.message}`, 'err');
  }
}

async function pullActiveSetFromNAServer() {
  try {
    const data = await requestNAServer('/api/japanese-learning-game/active-set');
    const now = new Date().toISOString();
    const localId = `server-${data.id}`;
    const existing = questionSets.find(set => set.serverId === data.id || set.id === localId);
    const target = existing || {
      id: localId,
      createdAt: now
    };

    target.name = data.name || 'NAServer Set';
    target.questions = Array.isArray(data.questions) ? data.questions : [];
    target.serverId = data.id;
    target.updatedAt = now;

    if (!existing) questionSets.push(target);
    activeSetId = target.id;
    syncQuestionsFromActiveSet();
    saveToStorage();
    refreshQuestionSetUI();
    refreshDataPreview();
    updateMenuUI();
    showToast(`Pulled ${target.questions.length} questions from NAServer`, 'ok');
  } catch (error) {
    showToast(`NAServer pull failed: ${error.message}`, 'err');
  }
}

async function pushActiveSetToNAServer() {
  const activeSet = getActiveQuestionSet();
  if (!activeSet) {
    showToast('No active question set to push', 'err');
    return;
  }

  try {
    updateActiveSetFromQuestions();
    const body = {
      name: activeSet.name || 'Untitled Set',
      questions: Array.isArray(activeSet.questions) ? activeSet.questions : []
    };
    let saved;
    if (activeSet.serverId) {
      await requestNAServer(`/api/japanese-learning-game/sets/${encodeURIComponent(activeSet.serverId)}`, {
        method: 'PUT',
        body
      });
      saved = { id: activeSet.serverId };
    } else {
      saved = await requestNAServer('/api/japanese-learning-game/sets', {
        method: 'POST',
        body
      });
      activeSet.serverId = saved.id;
    }
    await requestNAServer(`/api/japanese-learning-game/active-set?set_id=${encodeURIComponent(saved.id)}`, {
      method: 'POST'
    });
    activeSet.updatedAt = new Date().toISOString();
    saveQuestionSetsToStorage();
    refreshQuestionSetUI();
    showToast('Pushed active set to NAServer', 'ok');
  } catch (error) {
    showToast(`NAServer push failed: ${error.message}`, 'err');
  }
}
