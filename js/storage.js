// ================================================
// 日本誁EQUEST  EStorage Module
// ================================================

/* ── STORAGE ── */
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
  saveDailyStreak();
}

function saveQuestionSetsToStorage() {
  localStorage.setItem('jq_question_sets', JSON.stringify(questionSets));
  localStorage.setItem('jq_active_set', activeSetId);
}

function isServerBackedQuestionSet(set) {
  return !!(set?.serverOnly || set?.serverId);
}

function ensureQuestionSetsAvailable() {
  if (questionSets && questionSets.length > 0) return;
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

function resetQuestionSetsToDefaultExample() {
  const now = new Date().toISOString();
  questionSets = [{
    id: 'set-default',
    name: 'Default Set',
    questions: [...SAMPLE_DATA],
    createdAt: now,
    updatedAt: now
  }];
  activeSetId = questionSets[0].id;
  questions = questionSets[0].questions;
  saveQuestionSetsToStorage();
  localStorage.setItem('jq_questions', JSON.stringify(questions));
}

function removeServerQuestionSetsWhenOffline(force = false) {
  const hasServerSession = typeof isNAServerConfigured === 'function' && isNAServerConfigured();
  if (!force && hasServerSession) return false;
  const changed = force || questionSets.length !== 1 || questionSets[0]?.id !== 'set-default';
  resetQuestionSetsToDefaultExample();
  return changed;
}

function getActiveQuestionSet() {
  let set = questionSets.find(s => s.id === activeSetId);
  if (!set) set = questionSets[0] || null;
  if (set && set.id !== activeSetId) activeSetId = set.id;
  return set;
}

function getSelectedQuestionSetForManagement() {
  const selector = document.getElementById('question-set-selector');
  const selectedId = selector?.value;
  if (selectedId) {
    const selectedSet = questionSets.find(s => s.id === selectedId);
    if (selectedSet) return selectedSet;
  }
  return questionSets.find(s => s.id === activeSetId) || null;
}

function syncQuestionsFromActiveSet() {
  const set = getActiveQuestionSet();
  if (isServerBackedQuestionSet(set) && typeof isNAServerConfigured === 'function' && isNAServerConfigured()) {
    questions = [];
  } else {
    questions = set ? set.questions : [];
  }
  if (typeof initQuestionStats === 'function') {
    initQuestionStats(questions);
  }
}

function updateActiveSetFromQuestions() {
  const set = getActiveQuestionSet();
  if (!set) return;
  if (isServerBackedQuestionSet(set) && typeof isNAServerConfigured === 'function' && isNAServerConfigured()) {
    set.updatedAt = new Date().toISOString();
    return;
  }
  if (questions !== set.questions) {
    set.questions = questions;
  }
  set.updatedAt = new Date().toISOString();
}

function loadFromStorage() {
  if (!(typeof isNAServerConfigured === 'function' && isNAServerConfigured())) {
    resetQuestionSetsToDefaultExample();
  }

  const storedSets = localStorage.getItem('jq_question_sets');
  const storedActiveSet = localStorage.getItem('jq_active_set');

  if (typeof isNAServerConfigured === 'function' && isNAServerConfigured() && storedSets) {
    try {
      questionSets = JSON.parse(storedSets) || [];
    } catch (e) {
      questionSets = [];
    }
    activeSetId = storedActiveSet;
  } else if (typeof isNAServerConfigured === 'function' && isNAServerConfigured()) {
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

  if (!questionSets) {
    questionSets = [];
  }
  const removedOfflineServerSets = removeServerQuestionSetsWhenOffline();
  ensureQuestionSetsAvailable();

  if (!questionSets.some(s => s.id === activeSetId)) {
    activeSetId = questionSets[0].id;
  }
  if (removedOfflineServerSets) {
    saveQuestionSetsToStorage();
  }

  playerHP = parseInt(localStorage.getItem('jq_hp') ?? 100, 10);
  playerEXP = parseInt(localStorage.getItem('jq_exp') ?? 0, 10);
  playerLevel = parseInt(localStorage.getItem('jq_level') ?? 1, 10);
  playerCombo = parseInt(localStorage.getItem('jq_combo') ?? 0, 10);

  syncQuestionsFromActiveSet();
  normalizePlayerProgress();
}

function mergePlainObjects(defaults, overrides) {
  const result = { ...defaults };
  if (!overrides || typeof overrides !== 'object') return result;
  Object.keys(overrides).forEach(key => {
    const defaultValue = defaults ? defaults[key] : undefined;
    const overrideValue = overrides[key];
    if (
      defaultValue &&
      overrideValue &&
      typeof defaultValue === 'object' &&
      typeof overrideValue === 'object' &&
      !Array.isArray(defaultValue) &&
      !Array.isArray(overrideValue)
    ) {
      result[key] = mergePlainObjects(defaultValue, overrideValue);
    } else {
      result[key] = overrideValue;
    }
  });
  return result;
}

function loadSettingsFromStorage() {
  const s = localStorage.getItem('jq_settings');
  if (s) {
    try {
      const parsed = JSON.parse(s);
      settings = mergePlainObjects(settings, parsed);
    } catch (e) {
      settings = { ...settings };
    }
  }
}

function saveSettingsToStorage() {
  localStorage.setItem('jq_settings', JSON.stringify(settings));
}

function detectLegacyStats() {
  return Object.keys(questionStats).some(key => /^q-\d+$/.test(key));
}

function migrateStatsToHashBased() {
  const legacyKeys = Object.keys(questionStats).filter(key => /^q-\d+$/.test(key));
  const migrated = {};
  legacyKeys.forEach(key => {
    const index = parseInt(key.replace('q-', ''), 10);
    if (index >= 0 && index < questions.length) {
      const newId = getScopedQuestionId(questions[index]);
      migrated[newId] = questionStats[key];
    }
  });
  Object.keys(migrated).forEach(id => {
    questionStats[id] = migrated[id];
  });
  legacyKeys.forEach(key => delete questionStats[key]);
  initQuestionStats(questions);
  saveQuestionStats();
}

function loadQuestionStats() {
  if (typeof isNAServerConfigured === 'function' && isNAServerConfigured()) {
    questionStats = {};
    if (typeof loadQuestionStatsFromNAServer === 'function') {
      loadQuestionStatsFromNAServer().catch(error => {
        if (typeof showToast === 'function') showToast(`NAServer stats load failed: ${error.message}`, 'err');
      });
    }
    return;
  }
  const alreadyMigrated = localStorage.getItem('jq_stats_migrated') === 'true';
  const stored = localStorage.getItem('jq_question_stats');
  if (stored) {
    try {
      questionStats = JSON.parse(stored);
      seedIncorrectHistory();
    } catch (e) {
      questionStats = {};
    }
  }
  if (!alreadyMigrated && detectLegacyStats()) {
    try {
      migrateStatsToHashBased();
      localStorage.setItem('jq_stats_migrated', 'true');
    } catch (e) {
      console.warn('Stats migration failed, initializing empty stats:', e);
      questionStats = {};
      localStorage.setItem('jq_stats_migrated', 'true');
    }
  }
  initQuestionStats(questions);
}

function seedIncorrectHistory() {
  Object.keys(questionStats).forEach(id => {
    const qStats = questionStats[id];
    Object.keys(qStats).forEach(game => {
      if (game.startsWith('_')) return;
      const stats = qStats[game];
      if (stats.incorrect > 0 && (!stats.incorrectHistory || stats.incorrectHistory.length === 0)) {
        stats.incorrectHistory = stats.lastSeen ? [stats.lastSeen] : [];
      } else if (!stats.incorrectHistory) {
        stats.incorrectHistory = [];
      }
    });
  });
}

function saveQuestionStats() {
  if (typeof isNAServerConfigured === 'function' && isNAServerConfigured()) return;
  localStorage.setItem('jq_question_stats', JSON.stringify(questionStats));
}

function loadSessionHistory() {
  const stored = localStorage.getItem('jq_session_history');
  if (stored) {
    try {
      sessionHistory = JSON.parse(stored);
    } catch (e) {
      sessionHistory = [];
    }
  }
}

function saveSessionHistory() {
  localStorage.setItem('jq_session_history', JSON.stringify(sessionHistory));
}

function initQuestionStats(questionsArr) {
  const gameTypes = ['quiz', 'listen', 'flash', 'match', 'type', 'write'];
  questionsArr.forEach((q) => {
    const legacyId = generateQuestionId(q);
    const id = getScopedQuestionId(q);
    if (!questionStats[id] && questionStats[legacyId]) {
      questionStats[id] = questionStats[legacyId];
    }
    if (!questionStats[id]) {
      questionStats[id] = {};
    }
    gameTypes.forEach(game => {
      if (!questionStats[id][game]) {
        questionStats[id][game] = getDefaultQuestionTypeStats();
      }
    });
  });
}

function cleanupQuestionStats(deletedIndex) {
  const q = questions[deletedIndex];
  if (!q) return;
  const id = getScopedQuestionId(q);
  delete questionStats[id];
  if (!(typeof isNAServerConfigured === 'function' && isNAServerConfigured())) {
    saveQuestionStats();
  }
}

function createQuestionSet(name, items = []) {
  const id = `set-${Date.now()}`;
  const now = new Date().toISOString();
  const set = {
    id,
    name: name ? name.trim() : 'Untitled Set',
    questions: Array.isArray(items) ? items : [],
    isNewEmpty: !items || items.length === 0,
    createdAt: now,
    updatedAt: now
  };
  questionSets.push(set);
  activeSetId = id;
  syncQuestionsFromActiveSet();
  saveQuestionSetsToStorage();
  return set;
}

async function renameQuestionSet(id, name) {
  const set = questionSets.find(s => s.id === id);
  if (!set) return;
  const hasServerBacking = !!set.serverId || !!set.serverOnly;
  if (set.serverOnly && !set.canEdit) {
    showToast('You only have view permission for this set', 'err');
    return;
  }
  if (!name || !name.trim()) return;
  if (hasServerBacking && typeof renameQuestionSetOnNAServer === 'function') {
    try {
      await renameQuestionSetOnNAServer(id, name.trim());
      showToast('NAServer question set renamed', 'ok');
    } catch (error) {
      showToast(`Rename failed: ${error.message}`, 'err');
    }
    return;
  }
  set.name = name.trim();
  set.updatedAt = new Date().toISOString();
  saveQuestionSetsToStorage();
  refreshQuestionSetUI();
}

async function deleteQuestionSet(id) {
  const index = questionSets.findIndex(s => s.id === id);
  if (index === -1) return;
  const target = questionSets[index];
  const hasServerBacking = !!target.serverId || !!target.serverOnly;
  if (target.serverOnly && !target.canDelete) {
    showToast('Only owner/admin can delete this shared set', 'err');
    return;
  }
  const confirmed = await showConfirmDialog({
    title: 'Delete question set',
    message: `Delete "${target.name}" and all questions in it?`,
    confirmText: 'Delete set'
  });
  if (!confirmed) return;
  if (hasServerBacking && typeof deleteQuestionSetOnNAServer === 'function') {
    try {
      await deleteQuestionSetOnNAServer(id);
      showToast('NAServer question set deleted', 'ok');
    } catch (error) {
      showToast(`Delete failed: ${error.message}`, 'err');
    }
    return;
  }
  questionSets.splice(index, 1);
  if (!questionSets.some(s => s.id === activeSetId)) {
    activeSetId = questionSets[0]?.id || null;
  }
  syncQuestionsFromActiveSet();
  saveToStorage();
  refreshQuestionSetUI();
  refreshDataPreview();
  updateMenuUI();
}

async function switchQuestionSet(id) {
  if (!questionSets.some(s => s.id === id)) return;
  updateActiveSetFromQuestions();
  const previousActiveSetId = activeSetId;
  const previousQuestions = questions;
  activeSetId = id;
  const targetSet = questionSets.find(s => s.id === id);
  const hasServerBacking = !!targetSet?.serverId || !!targetSet?.serverOnly;
  if (hasServerBacking && typeof isNAServerConfigured === 'function' && isNAServerConfigured()) {
    try {
      if (typeof setNAServerBusy === 'function') setNAServerBusy(true, 'Switching NAServer question set...', 25);
      await setActiveQuestionSetOnNAServer(id);
      if (typeof loadActiveSetFromNAServer === 'function') {
        await loadActiveSetFromNAServer();
      } else {
        questions = [];
      }
      saveQuestionSetsToStorage();
      refreshQuestionSetUI();
      refreshDataPreview();
      updateMenuUI();
    } catch (error) {
      activeSetId = previousActiveSetId;
      questions = previousQuestions;
      saveQuestionSetsToStorage();
      refreshQuestionSetUI();
      refreshDataPreview();
      updateMenuUI();
      showToast(`Switch set failed: ${error.message}`, 'err');
    } finally {
      if (typeof setNAServerBusy === 'function') setNAServerBusy(false);
    }
    return;
  }
  syncQuestionsFromActiveSet();
  saveQuestionSetsToStorage();
  refreshQuestionSetUI();
  refreshDataPreview();
  updateMenuUI();
}

function refreshQuestionSetUI() {
  const selector = document.getElementById('question-set-selector');
  const activeNameEl = document.getElementById('active-set-name');
  const activeSet = getActiveQuestionSet();

  if (selector) {
    selector.innerHTML = questionSets.map(set => {
      const count = set.serverOnly ? (set.question_count ?? 0) : (set.questions?.length || 0);
      const source = set.serverOnly || set.serverId ? 'server' : 'local';
      const dirty = !set.serverOnly && !set.serverId ? ' *' : '';
      const permission = set.serverOnly && set.permission ? ` ${set.permission}` : '';
      return `<option value="${escapeHtml(set.id)}"${set.id === activeSet?.id ? ' selected' : ''}>${escapeHtml(set.name)}${dirty} (${source}) (${count})${escapeHtml(permission)}</option>`;
    }).join('');
  }
  if (activeNameEl) {
    activeNameEl.textContent = activeSet ? activeSet.name : 'No active set';
  }
  if (activeSet && document.getElementById('current-count')) {
    document.getElementById('current-count').textContent = activeSet.serverOnly ? (activeSet.question_count || 0) : activeSet.questions.length;
  } else if (document.getElementById('current-count')) {
    document.getElementById('current-count').textContent = '0';
  }
  const renameBtn = document.getElementById('btn-rename-set');
  const deleteBtn = document.getElementById('btn-delete-set');
    const shareBtn = document.getElementById('btn-share-set');
    const pullBtn = document.getElementById('btn-pull-active');
    const pushBtn = document.getElementById('btn-push-active');
    const serverConfigured = typeof isNAServerConfigured === 'function' && isNAServerConfigured();
    const canEdit = !!activeSet && (!activeSet.serverOnly || !!activeSet.canEdit);
    const canDelete = !!activeSet && (!activeSet.serverOnly || !!activeSet.canDelete);
    const hasServerBacking = !!activeSet && (!!activeSet.serverId || !!activeSet.serverOnly);
    const showShare = serverConfigured && hasServerBacking;
    const canShare = showShare && !!activeSet?.canShare;
    if (renameBtn) renameBtn.disabled = !canEdit;
    if (deleteBtn) deleteBtn.disabled = !canDelete;
    if (shareBtn) {
      shareBtn.disabled = !canShare;
      if (typeof setHidden === 'function') setHidden(shareBtn, !showShare);
    }
    const canPull = serverConfigured && hasServerBacking;
    if (pullBtn) {
      pullBtn.disabled = !canPull;
      if (typeof setHidden === 'function') setHidden(pullBtn, !canPull);
    }
    const canPushLocal = serverConfigured && !!activeSet && !hasServerBacking;
  if (pushBtn) {
    pushBtn.disabled = !canPushLocal;
    if (typeof setHidden === 'function') setHidden(pushBtn, !canPushLocal);
  }
  if (typeof updateImportExportVisibility === 'function') {
    updateImportExportVisibility();
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
  const activeSet = getSelectedQuestionSetForManagement();
  if (!activeSet) return;
  const name = prompt('Enter new name for this question set:', activeSet.name);
  if (!name || !name.trim()) return;
  renameQuestionSet(activeSet.id, name.trim());
}

function deleteActiveQuestionSet() {
  const activeSet = getSelectedQuestionSetForManagement();
  if (!activeSet) return;
  return deleteQuestionSet(activeSet.id);
}

let shareUserSearchTimer = null;
let shareUserPage = 1;
let shareActiveSetId = null;
let currentShareUsers = [];

async function promptShareQuestionSet() {
  const activeSet = getActiveQuestionSet();
  const hasServerBacking = !!activeSet && (!!activeSet.serverId || !!activeSet.serverOnly);
  if (!hasServerBacking || !activeSet.canShare) {
    showToast('Only owner/admin can share this server set', 'err');
    return;
  }
  shareActiveSetId = activeSet.id;
  shareUserPage = 1;
  const search = document.getElementById('share-user-search');
  if (search) search.value = '';
  const permission = document.getElementById('share-permission');
  if (permission) permission.value = 'view';
  document.getElementById('share-set-modal')?.classList.remove('hidden');
  await loadShareUsers();
  search?.focus();
}

function closeShareQuestionSetModal() {
  document.getElementById('share-set-modal')?.classList.add('hidden');
  shareActiveSetId = null;
}

function updateShareUserSearch() {
  shareUserPage = 1;
  if (shareUserSearchTimer) clearTimeout(shareUserSearchTimer);
  shareUserSearchTimer = setTimeout(() => {
    loadShareUsers();
  }, 300);
}

async function loadShareUsers(page = shareUserPage) {
  const list = document.getElementById('share-user-list');
  if (!list) return;
  if (typeof searchJapaneseGameUsersOnNAServer !== 'function') {
    list.innerHTML = '<div class="empty-data">NAServer user search is not available.</div>';
    return;
  }
  shareUserPage = page;
  const query = document.getElementById('share-user-search')?.value.trim() || '';
  list.innerHTML = '<div class="empty-data">Loading users...</div>';
  try {
    const payload = await searchJapaneseGameUsersOnNAServer(query, shareUserPage, 20);
    const users = Array.isArray(payload.users) ? payload.users.filter(user => !user.is_current_user) : [];
    currentShareUsers = users;
    const pagination = payload.pagination || {};
    if (!users.length) {
      list.innerHTML = '<div class="empty-data">No users found.</div>';
      return;
    }
    const rows = users.map(user => {
      const disabled = user.is_current_user || user.approval_status !== 'approved' || user.is_blocked;
      const status = user.is_blocked ? 'blocked' : (user.approval_status || 'pending');
      return `
        <tr>
          <td>${escapeHtml(user.email || '')}</td>
          <td>${escapeHtml(user.role || 'user')}</td>
          <td>${escapeHtml(status)}</td>
          <td>
            <button type="button" class="action-btn btn-secondary" onclick="shareQuestionSetWithUser('${escapeHtml(user.id)}')" ${disabled ? 'disabled' : ''}>Share</button>
          </td>
        </tr>`;
    }).join('');
    const pageCount = Math.max(1, pagination.page_count || 1);
    list.innerHTML = `
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="pagination">
        <button type="button" class="page-btn" onclick="loadShareUsers(${shareUserPage - 1})" ${shareUserPage <= 1 ? 'disabled' : ''}>‹ Previous</button>
        <span class="page-info">Page ${shareUserPage} / ${pageCount}</span>
        <button type="button" class="page-btn" onclick="loadShareUsers(${shareUserPage + 1})" ${shareUserPage >= pageCount ? 'disabled' : ''}>Next ›</button>
      </div>`;
  } catch (error) {
    list.innerHTML = `<div class="empty-data">Failed to load users: ${escapeHtml(error.message)}</div>`;
  }
}

async function shareQuestionSetWithUser(userId) {
  const user = currentShareUsers.find(item => item.id === userId);
  if (!user) {
    showToast('User is no longer in the current share list', 'err');
    return;
  }
  const permission = (document.getElementById('share-permission')?.value || 'view').trim().toLowerCase();
  if (!['view', 'edit', 'admin'].includes(permission)) {
    showToast('Invalid share permission', 'err');
    return;
  }
  try {
    await shareQuestionSetOnNAServer(shareActiveSetId, user.email || '', permission, userId);
    showToast('Question set shared', 'ok');
    await loadShareUsers();
  } catch (error) {
    showToast(`Share failed: ${error.message}`, 'err');
  }
}

function applyScanlinesVisibility() {
  const scanlines = document.querySelector('.scanlines');
  if (!scanlines) return;
  scanlines.style.display = settings.scanlinesEnabled ? 'block' : 'none';
}

function updateAnimationBodyClass() {
  if (settings.animationEnabled === false) {
    document.body.classList.add('animations-disabled');
  } else {
    document.body.classList.remove('animations-disabled');
  }
}
