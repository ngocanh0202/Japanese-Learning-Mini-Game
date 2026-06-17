// ================================================
// 日本語 QUEST ? Data Manager Module
// ================================================

let importEditIndex = null;
let importMode = 'url';
let searchQuery = '';
let questionSearchTimer = null;
let currentServerPageItems = [];
let questionEditState = null;
const DATA_PAGE_SIZE = 4;

function getBlankQuestion() {
  return {
    word: '',
    romaji: '',
    translation: '',
    q: '',
    a: ['', '', '', ''],
    c: 0,
    ex: ''
  };
}

function getQuestionListToolbar(activeSet = getActiveQuestionSet()) {
  const serverBacked = !!activeSet && (!!activeSet.serverOnly || !!activeSet.serverId);
  const disabled = serverBacked && !activeSet.canEdit ? 'disabled' : '';
  return `
    <div class="question-list-toolbar">
      <button type="button" class="action-btn btn-green" onclick="addQuestion()" ${disabled}>＋ Add question</button>
    </div>`;
}

/* ── IMPORT MODAL ── */
function openImportModal(index = null) {
  const activeSet = getActiveQuestionSet();
  const serverBacked = !!activeSet && (!!activeSet.serverOnly || !!activeSet.serverId);
  if (serverBacked && !activeSet.canEdit) {
    showToast('You only have view permission for this set', 'err');
    return;
  }
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
    title.textContent = '?? EDIT QUESTION';
    replaceBtn.classList.add('hidden');
    appendBtn.classList.add('hidden');
    editBtn.classList.remove('hidden');
  } else {
    importEditIndex = null;
    textarea.value = '';
    title.textContent = '?? IMPORT DATA';
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
  if (title) title.textContent = '?? IMPORT DATA';
  if (replaceBtn) replaceBtn.classList.remove('hidden');
  if (appendBtn) appendBtn.classList.remove('hidden');
  if (editBtn) editBtn.classList.add('hidden');
}

function getQuestionEditField(id) {
  return document.getElementById(`question-edit-${id}`);
}

function setQuestionEditValue(id, value) {
  const field = getQuestionEditField(id);
  if (field) field.value = value ?? '';
}

function openQuestionEditModal(question, state) {
  const activeSet = getActiveQuestionSet();
  const serverBacked = !!activeSet && (!!activeSet.serverOnly || !!activeSet.serverId);
  if (serverBacked && !activeSet.canEdit) {
    showToast('You only have view permission for this set', 'err');
    return;
  }
  const modal = document.getElementById('question-edit-modal');
  if (!modal || !question) return;
  questionEditState = state;
  setQuestionEditValue('word', question.word || '');
  setQuestionEditValue('romaji', question.romaji || '');
  setQuestionEditValue('translation', question.translation || '');
  setQuestionEditValue('prompt', question.q || '');
  setQuestionEditValue('answers', Array.isArray(question.a) ? question.a.join('\n') : '');
  setQuestionEditValue('correct', Number.isInteger(question.c) ? String(question.c + 1) : '1');
  setQuestionEditValue('example', question.ex || '');
  modal.classList.remove('hidden');
  getQuestionEditField('word')?.focus();
}

function closeQuestionEditModal() {
  const modal = document.getElementById('question-edit-modal');
  if (modal) modal.classList.add('hidden');
  questionEditState = null;
}

function readQuestionEditPayload() {
  const answers = (getQuestionEditField('answers')?.value || '')
    .split(/\r?\n/)
    .map(answer => answer.trim())
    .filter(Boolean);
  const correctNumber = parseInt(getQuestionEditField('correct')?.value || '1', 10);
  const payload = {
    word: (getQuestionEditField('word')?.value || '').trim(),
    romaji: (getQuestionEditField('romaji')?.value || '').trim(),
    translation: (getQuestionEditField('translation')?.value || '').trim(),
    q: (getQuestionEditField('prompt')?.value || '').trim(),
    a: answers,
    c: Number.isFinite(correctNumber) ? correctNumber - 1 : 0,
    ex: (getQuestionEditField('example')?.value || '').trim()
  };
  if (!payload.word || !payload.romaji || !payload.q) {
    throw new Error('Word, romaji, and question are required');
  }
  if (!payload.a.length) {
    throw new Error('At least one answer option is required');
  }
  if (payload.c < 0 || payload.c >= payload.a.length) {
    throw new Error('Correct answer number must match an answer line');
  }
  return payload;
}

function updateActiveServerTimestamp(updatedAt) {
  if (!updatedAt) return;
  const activeSet = getActiveQuestionSet();
  if (activeSet?.serverOnly || activeSet?.serverId) {
    activeSet.updatedAt = updatedAt;
  }
}

async function saveQuestionEdit() {
  try {
    if (!questionEditState) throw new Error('No question selected for editing');
    const payload = readQuestionEditPayload();
    if (questionEditState.mode === 'add' && questionEditState.source === 'server') {
      const result = await addQuestionOnNAServer(questionEditState.setId, payload);
      updateActiveServerTimestamp(result.updated_at);
      const activeSet = getActiveQuestionSet();
      if (activeSet) activeSet.question_count = (activeSet.question_count || 0) + 1;
      showToast('Server question added', 'ok');
    } else if (questionEditState.source === 'server') {
      const result = await updateQuestionOnNAServer(questionEditState.setId, questionEditState.questionId, payload);
      updateActiveServerTimestamp(result.updated_at);
      showToast('Server question updated', 'ok');
    } else if (questionEditState.mode === 'add') {
      questions.push(payload);
      const activeSet = getActiveQuestionSet();
      if (activeSet) activeSet.isNewEmpty = false;
      saveToStorage();
      updateMenuUI();
      showToast('Question added', 'ok');
    } else {
      if (questionEditState.index < 0 || questionEditState.index >= questions.length) {
        throw new Error('Local question no longer exists');
      }
      questions[questionEditState.index] = payload;
      saveToStorage();
      updateMenuUI();
      showToast('Question updated', 'ok');
    }
    closeQuestionEditModal();
    await refreshDataPreview();
  } catch (e) {
    showToast(`Edit failed: ${e.message}`, 'err');
  }
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
    const activeSet = getActiveQuestionSet();
    if (activeSet) activeSet.isNewEmpty = false;
    saveToStorage();
    setStatus('data-status', `? Imported ${parsed.length} questions!`, 'ok');
    refreshDataPreview();
    updateMenuUI();
    closeImportModal();
  } catch (e) {
    setStatus('data-status', `? Error: ${e.message}`, 'err');
    showToast(`? Import failed: ${e.message}`, 'err');
  }
}

function applyImportAppend() {
  try {
    const raw = document.getElementById('import-textarea').value.trim();
    const parsed = parseImportPayload(raw);
    questions = questions.concat(parsed);
    const activeSet = getActiveQuestionSet();
    if (activeSet) activeSet.isNewEmpty = false;
    saveToStorage();
    setStatus('data-status', `? Added ${parsed.length} questions!`, 'ok');
    refreshDataPreview();
    updateMenuUI();
    closeImportModal();
  } catch (e) {
    setStatus('data-status', `? Error: ${e.message}`, 'err');
    showToast(`? Import failed: ${e.message}`, 'err');
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
    setStatus('data-status', `? Updated question #${importEditIndex + 1}!`, 'ok');
    refreshDataPreview();
    updateMenuUI();
    closeImportModal();
  } catch (e) {
    setStatus('data-status', `? Error: ${e.message}`, 'err');
    showToast(`? Edit failed: ${e.message}`, 'err');
  }
}

async function clearData() {
  const confirmed = await showConfirmDialog({
    title: 'Clear question set',
    message: 'Clear all questions in the current question set?',
    confirmText: 'Clear set'
  });
  if (!confirmed) return;
  questions = [];
  updateActiveSetFromQuestions();
  saveToStorage();
  refreshDataPreview();
  updateMenuUI();
  setStatus('data-status', '?? Current set cleared.', 'err');
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
    showToast(`? Exported ${questions.length} questions to ${filename}`, 'ok');
  } catch (e) {
    showToast(`? Export failed: ${e.message}`, 'err');
  }
}

function loadSampleData() {
  questions = [...SAMPLE_DATA];
  const activeSet = getActiveQuestionSet();
  if (activeSet) activeSet.isNewEmpty = false;
  dataPage = 1;
  saveToStorage();
  setStatus('data-status', `? Loaded ${questions.length} sample questions!`, 'ok');
  refreshDataPreview();
  updateMenuUI();
}

function getPageCount() {
  const activeSet = typeof getActiveQuestionSet === 'function' ? getActiveQuestionSet() : null;
  const serverBacked = !!activeSet && (!!activeSet.serverOnly || !!activeSet.serverId);
  if (serverBacked && typeof isNAServerConfigured === 'function' && isNAServerConfigured()) {
    return Math.max(1, Math.ceil((activeSet.question_count || 0) / DATA_PAGE_SIZE));
  }
  return Math.max(1, Math.ceil(questions.length / DATA_PAGE_SIZE));
}

function setDataPage(page) {
  const pageCount = getPageCount();
  dataPage = Math.min(Math.max(1, page), pageCount);
  return refreshDataPreview();
}

function setStatus(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `status-msg status-${type}`;
}

/* ── DATA PREVIEW ── */
async function refreshDataPreview() {
  const list = document.getElementById('question-list');
  if (!list) return;
  const activeSet = typeof getActiveQuestionSet === 'function' ? getActiveQuestionSet() : null;
  const serverBacked = !!activeSet && (!!activeSet.serverOnly || !!activeSet.serverId);

  if (
    serverBacked &&
    typeof isNAServerConfigured === 'function' &&
    isNAServerConfigured() &&
    typeof loadQuestionSetPageFromNAServer === 'function'
  ) {
    try {
      const payload = await loadQuestionSetPageFromNAServer(activeSet.id, dataPage, DATA_PAGE_SIZE, searchQuery);
      if (payload.updated_at) activeSet.updatedAt = payload.updated_at;
      const pageItems = Array.isArray(payload.questions) ? payload.questions : [];
      currentServerPageItems = pageItems;
      const pagination = payload.pagination || {};
      const total = pagination.total ?? activeSet.question_count ?? pageItems.length;
      const pageCount = Math.max(1, pagination.page_count || Math.ceil(total / DATA_PAGE_SIZE));
      dataPage = Math.min(Math.max(1, pagination.page || dataPage), pageCount);
      document.getElementById('current-count').textContent = String(total);
      updateImportExportVisibility(total);

      if (pageItems.length === 0) {
        list.innerHTML = `
          ${getQuestionListToolbar(activeSet)}
          <div class="empty-data">${searchQuery ? 'No server questions match your search.' : 'No questions in this server set.'}</div>`;
        return;
      }

      const startIndex = (dataPage - 1) * DATA_PAGE_SIZE;
      let rows = '';
      pageItems.forEach((q, index) => {
        const i = startIndex + index;
        const actionDisabled = activeSet.canEdit ? '' : 'disabled';
        rows += `
          <tr>
            <td>${i + 1}</td>
            <td>${escapeHtml(q.word)}</td>
            <td>${escapeHtml(q.q)}</td>
            <td><span class="source-badge source-server">Server</span></td>
            <td>
              <button type="button" class="action-btn btn-secondary" onclick="editQuestion(${index}, 'server')" ${actionDisabled}>Edit</button>
              <button type="button" class="action-btn btn-danger" onclick="deleteQuestion(${index}, 'server')" ${actionDisabled}>Delete</button>
            </td>
          </tr>`;
      });

      const prevDisabled = dataPage <= 1 ? 'disabled' : '';
      const nextDisabled = dataPage >= pageCount ? 'disabled' : '';
      list.innerHTML = `
        ${getQuestionListToolbar(activeSet)}
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Word</th>
                <th>Question</th>
                <th>Source</th>
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
      return;
    } catch (error) {
      list.innerHTML = `<div class="empty-data">Failed to load server questions: ${escapeHtml(error.message)}</div>`;
      return;
    }
  }

  currentServerPageItems = [];
  const filteredQuestions = searchQuery
    ? questions
      .map((q, originalIndex) => ({ q, originalIndex }))
      .filter(item => {
        const q = item.q;
        const text = `${q.word} ${q.q} ${q.romaji} ${q.translation || ''}`.toLowerCase();
        return text.includes(searchQuery);
      })
    : questions.map((q, originalIndex) => ({ q, originalIndex }));

  document.getElementById('current-count').textContent = filteredQuestions.length;
  updateImportExportVisibility(filteredQuestions.length);

  if (filteredQuestions.length === 0) {
    list.innerHTML = `
      ${getQuestionListToolbar(activeSet)}
      <div class="empty-data">No matching questions found.</div>`;
    return;
  }

  const pageCount = Math.max(1, Math.ceil(filteredQuestions.length / DATA_PAGE_SIZE));
  if (dataPage > pageCount) dataPage = pageCount;
  const startIndex = (dataPage - 1) * DATA_PAGE_SIZE;
  const pageItems = filteredQuestions.slice(startIndex, startIndex + DATA_PAGE_SIZE);

  let rows = '';
  pageItems.forEach((item, index) => {
    const q = item.q;
    const i = startIndex + index;
    rows += `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(q.word)}</td>
        <td>${escapeHtml(q.q)}</td>
        <td><span class="source-badge source-local">Local</span></td>
        <td>
          <button type="button" class="action-btn btn-secondary" onclick="editQuestion(${item.originalIndex}, 'local')">Edit</button>
          <button type="button" class="action-btn btn-danger" onclick="deleteQuestion(${item.originalIndex}, 'local')">Delete</button>
        </td>
      </tr>`;
  });

  const prevDisabled = dataPage <= 1 ? 'disabled' : '';
  const nextDisabled = dataPage >= pageCount ? 'disabled' : '';

  list.innerHTML = `
    ${getQuestionListToolbar(activeSet)}
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Word</th>
            <th>Question</th>
            <th>Source</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <button type="button" class="page-btn" onclick="setDataPage(${dataPage - 1})" ${prevDisabled}>? Previous</button>
      <span class="page-info">Page ${dataPage} / ${pageCount}</span>
      <button type="button" class="page-btn" onclick="setDataPage(${dataPage + 1})" ${nextDisabled}>Next ?</button>
    </div>`;
}

function updateImportExportVisibility(questionCount = null) {
  const card = document.getElementById('import-export-card');
  if (!card?.classList) return;
  const activeSet = typeof getActiveQuestionSet === 'function' ? getActiveQuestionSet() : null;
  const serverBacked = !!activeSet && (!!activeSet.serverOnly || !!activeSet.serverId);
  const count = questionCount ?? (serverBacked ? activeSet.question_count : questions.length) ?? 0;
  const showImportExport = !!activeSet?.isNewEmpty && count === 0;
  card.classList.toggle('hidden', !showImportExport);
  card.classList.toggle('is-empty-set', count === 0);
}

function addQuestion() {
  const activeSet = getActiveQuestionSet();
  const serverBacked = !!activeSet && (!!activeSet.serverOnly || !!activeSet.serverId);
  if (serverBacked && !activeSet.canEdit) {
    showToast('You only have view permission for this set', 'err');
    return;
  }
  openQuestionEditModal(getBlankQuestion(), {
    source: serverBacked ? 'server' : 'local',
    mode: 'add',
    setId: activeSet?.id
  });
}

function editQuestion(index, source = 'local') {
  if (source === 'server') {
    const activeSet = getActiveQuestionSet();
    const question = currentServerPageItems[index];
    const serverBacked = !!activeSet && (!!activeSet.serverOnly || !!activeSet.serverId);
    if (!serverBacked || !question?.id) {
      showToast('No server question selected', 'err');
      return;
    }
    openQuestionEditModal(question, {
      source: 'server',
      setId: activeSet.id,
      questionId: question.id
    });
    return;
  }
  if (index < 0 || index >= questions.length) return;
  openQuestionEditModal(questions[index], {
    source: 'local',
    index
  });
}

async function deleteQuestion(index, source = 'local') {
  const activeSet = getActiveQuestionSet();
  const serverBacked = !!activeSet && (!!activeSet.serverOnly || !!activeSet.serverId);
  if (serverBacked && !activeSet.canEdit) {
    showToast('You only have view permission for this set', 'err');
    return;
  }
  const confirmed = await showConfirmDialog({
    title: 'Delete question',
    message: 'Delete this question from the current question set?',
    confirmText: 'Delete'
  });
  if (!confirmed) return;
  if (source === 'server') {
    const question = currentServerPageItems[index];
    if (!serverBacked || !question?.id) {
      showToast('No server question selected', 'err');
      return;
    }
    try {
      const result = await deleteQuestionOnNAServer(activeSet.id, question.id);
      updateActiveServerTimestamp(result.updated_at);
      activeSet.question_count = Math.max(0, (activeSet.question_count || 1) - 1);
      showToast('Server question deleted', 'ok');
      refreshQuestionSetUI();
      await refreshDataPreview();
    } catch (error) {
      showToast(`Delete failed: ${error.message}`, 'err');
    }
    return;
  }
  if (index < 0 || index >= questions.length) return;
    cleanupQuestionStats(index);
    questions.splice(index, 1);
    saveToStorage();
    refreshQuestionSetUI();
    refreshDataPreview();
    updateMenuUI();
  }

function updateQuestionSearch() {
  const input = document.getElementById('question-search');
  if (!input) return;
  searchQuery = input.value.trim().toLowerCase();
  dataPage = 1;
  if (questionSearchTimer) clearTimeout(questionSearchTimer);
  questionSearchTimer = setTimeout(() => {
    refreshDataPreview();
  }, 300);
}

/* ── FIREBASE CONFIG ── */
function sanitizeFileName(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function toggleImportMode() {
  const input = document.getElementById('import-url-input');
  importMode = 'url';
  if (input) input.placeholder = 'Paste JSON URL here...';
}

function handleGetButton() {
  const input = document.getElementById('import-url-input').value.trim();
  
  if (!input) {
    showToast('? Please enter a value', 'err');
    return;
  }
  
  importFromGenericUrl();
}

function validateGenericUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is empty' };
  }
  
  url = url.trim();
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return { valid: false, error: 'Invalid URL format - must start with http:// or https://' };
  }
  
  return { valid: true, url };
}

function parseGenericJson(data) {
  if (!data) {
    throw new Error('Empty response from URL');
  }
  
  const parsed = typeof data === 'string' ? JSON.parse(data) : data;
  
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('JSON must be an array with at least one question');
  }
  
  parsed.forEach((item, i) => {
    if (!item.word || !item.q || !Array.isArray(item.a) || item.c === undefined || !item.romaji) {
      throw new Error(`Item ${i} is missing required fields`);
    }
  });
  
  return parsed;
}

function promptForSetName(defaultName, callback) {
  const name = prompt('Enter name for this question set:', defaultName);
  if (!name || !name.trim()) {
    showToast('? Import cancelled', 'err');
    return null;
  }
  return callback(name.trim());
}

async function importFromGenericUrl() {
  const urlInput = document.getElementById('import-url-input');
  const url = urlInput.value.trim();
  
  const validation = validateGenericUrl(url);
  if (!validation.valid) {
    showToast('? ' + validation.error, 'err');
    return;
  }

  try {
    const response = await fetch(validation.url);
    if (!response.ok) {
      throw new Error('Failed to fetch URL');
    }
    
    const text = await response.text();
    if (!text || text.trim() === '') {
      throw new Error('Empty response from URL');
    }
    
    const questions = parseGenericJson(text);
    
    let suggestedName = 'Imported Set';
    try {
      const urlObj = new URL(validation.url);
      const pathParts = urlObj.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      if (fileName && fileName.endsWith('.json')) {
        suggestedName = fileName.replace('.json', '').replace(/_/g, ' ');
      }
    } catch (e) {
    }
    
    const result = promptForSetName(suggestedName, (name) => {
      const now = new Date().toISOString();
      const newSet = {
        id: 'set-' + Date.now(),
        name: name,
        questions: questions,
        createdAt: now,
        updatedAt: now
      };
      
      questionSets.push(newSet);
      activeSetId = newSet.id;
      syncQuestionsFromActiveSet();
      saveToStorage();
      
      urlInput.value = '';
      refreshQuestionSetUI();
      refreshDataPreview();
      updateMenuUI();
      
      showToast(`? Imported ${questions.length} questions!`, 'ok');
    });
    
  } catch (e) {
    showToast('? Import failed: ' + e.message, 'err');
  }
}


