// Optional NAServer sync. Local storage remains the source of truth unless configured.
const NASERVER_CONFIG_KEY = 'jq_naserver_config';

function loadNAServerConfig() {
  try {
    const raw = localStorage.getItem(NASERVER_CONFIG_KEY);
    return raw ? JSON.parse(raw) : { baseUrl: '', token: '' };
  } catch (_) {
    return { baseUrl: '', token: '' };
  }
}

function getNAServerBaseUrl(config = loadNAServerConfig()) {
  return (config.baseUrl || '').replace(/\/+$/, '');
}

function getNAServerHeaders(config = loadNAServerConfig()) {
  const headers = { 'Content-Type': 'application/json' };
  if (config.token) headers.Authorization = `Bearer ${config.token}`;
  return headers;
}

async function requestNAServer(path, options = {}) {
  const config = loadNAServerConfig();
  const baseUrl = getNAServerBaseUrl(config);
  if (!baseUrl || !config.token) {
    throw new Error('NAServer base URL and token are required');
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
  const baseInput = document.getElementById('naserver-base-url');
  const tokenInput = document.getElementById('naserver-token');
  if (baseInput) baseInput.value = config.baseUrl || '';
  if (tokenInput) tokenInput.value = config.token || '';
}

function saveNAServerConfigFromUI() {
  const baseInput = document.getElementById('naserver-base-url');
  const tokenInput = document.getElementById('naserver-token');
  const config = {
    baseUrl: baseInput ? baseInput.value.trim() : '',
    token: tokenInput ? tokenInput.value.trim() : ''
  };
  localStorage.setItem(NASERVER_CONFIG_KEY, JSON.stringify(config));
  showToast('NAServer config saved', 'ok');
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
