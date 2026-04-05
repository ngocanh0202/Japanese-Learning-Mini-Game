// ================================================
// 日本語 QUEST — Data Manager Module
// ================================================

let importEditIndex = null;
let importMode = 'url';
let searchQuery = '';
const DATA_PAGE_SIZE = 4;

/* ── IMPORT MODAL ── */
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

function closeFirebaseSetsModal() {
  const modal = document.getElementById('firebase-sets-modal');
  if (modal) modal.classList.add('hidden');
}

async function showFirebaseSetsModal() {
  const config = loadFirebaseConfig();
  if (!config || !config.projectId) {
    showToast('❌ Please configure Firebase first', 'err');
    toggleFirebaseConfig();
    return;
  }

  if (!isOnline()) {
    showToast('❌ No internet connection', 'err');
    return;
  }

  const listEl = document.getElementById('firebase-sets-list');
  if (!listEl) return;
  
  listEl.innerHTML = '<div class="loading">Loading...</div>';
  
  const modal = document.getElementById('firebase-sets-modal');
  if (modal) modal.classList.remove('hidden');

  try {
    const initialized = initializeFirebase(config);
    if (!initialized) throw new Error('Failed to initialize Firebase');

    const networkEnabled = await ensureNetwork();
    if (!networkEnabled) throw new Error('Cannot connect to Firebase');

    const db = getFirestore();
    const snapshot = await db.collection('question-sets').get();
    
    if (snapshot.empty) {
      listEl.innerHTML = '<div class="empty-message">No question sets in Firebase</div>';
      return;
    }

    const sets = [];
    snapshot.forEach(doc => {
      sets.push({ id: doc.id, ...doc.data() });
    });

    renderFirebaseSetsList(sets);
  } catch (e) {
    console.error('Error fetching Firebase sets:', e);
    listEl.innerHTML = `<div class="error-message">Error: ${escapeHtml(e.message)}</div>`;
    showToast(`❌ ${e.message}`, 'err');
  }
}

function renderFirebaseSetsList(sets) {
  const listEl = document.getElementById('firebase-sets-list');
  if (!listEl) return;

  const activeSet = getActiveQuestionSet();
  const activeFirestoreId = activeSet ? activeSet.firestoreId : null;

  listEl.innerHTML = sets.map(set => `
    <div class="firebase-set-item">
      <div class="firebase-set-info">
        <div class="firebase-set-name">${escapeHtml(set.name || 'Untitled')}</div>
        <div class="firebase-set-count">${set.questions ? set.questions.length : 0} questions</div>
      </div>
      <div class="firebase-set-actions">
        <button class="action-btn btn-secondary btn-sm" onclick="copyFirebaseSetUrl('${escapeHtml(set.id)}')">📋 URL</button>
        <button class="action-btn btn-sm" onclick="importFirebaseSet('${escapeHtml(set.id)}')">📥 Import</button>
        <button class="action-btn btn-danger btn-sm" onclick="deleteFirebaseSet('${escapeHtml(set.id)}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function copyFirebaseSetUrl(docId) {
  const config = loadFirebaseConfig();
  if (!config || !config.projectId) return;
  
  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/question-sets/${docId}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast('✅ URL copied to clipboard', 'ok');
  }).catch(() => {
    showToast('❌ Failed to copy URL', 'err');
  });
}

async function importFirebaseSet(docId) {
  const config = loadFirebaseConfig();
  if (!config || !config.projectId) {
    showToast('❌ Firebase not configured', 'err');
    return;
  }

  if (!isOnline()) {
    showToast('❌ No internet connection', 'err');
    return;
  }

  try {
    const initialized = initializeFirebase(config);
    if (!initialized) throw new Error('Failed to initialize Firebase');

    const networkEnabled = await ensureNetwork();
    if (!networkEnabled) throw new Error('Cannot connect to Firebase');

    const db = getFirestore();
    const doc = await db.collection('question-sets').doc(docId).get();
    
    if (!doc.exists) {
      throw new Error('Document not found');
    }

    const data = doc.data();
    
    const newSet = {
      id: 'set-' + Date.now(),
      name: (data.name || 'Imported Set') + ' (Firebase)',
      questions: data.questions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      firestoreId: docId
    };

    questionSets.push(newSet);
    activeSetId = newSet.id;
    questions = newSet.questions;
    saveQuestionSetsToStorage();
    refreshQuestionSetUI();
    
    closeFirebaseSetsModal();
    showToast(`✅ Imported "${newSet.name}"`, 'ok');
  } catch (e) {
    console.error('Error importing Firebase set:', e);
    showToast(`❌ ${e.message}`, 'err');
  }
}

async function deleteFirebaseSet(docId) {
  if (!confirm('Are you sure you want to delete this set from Firebase?')) {
    return;
  }

  const config = loadFirebaseConfig();
  if (!config || !config.projectId) {
    showToast('❌ Firebase not configured', 'err');
    return;
  }

  if (!isOnline()) {
    showToast('❌ No internet connection', 'err');
    return;
  }

  try {
    const initialized = initializeFirebase(config);
    if (!initialized) throw new Error('Failed to initialize Firebase');

    const networkEnabled = await ensureNetwork();
    if (!networkEnabled) throw new Error('Cannot connect to Firebase');

    const db = getFirestore();
    await db.collection('question-sets').doc(docId).delete();

    showToast('✅ Deleted from Firebase', 'ok');
    showFirebaseSetsModal();
  } catch (e) {
    console.error('Error deleting Firebase set:', e);
    showToast(`❌ ${e.message}`, 'err');
  }
}

/* ── IMPORT/EXPORT ── */
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

function setStatus(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `status-msg status-${type}`;
}

/* ── DATA PREVIEW ── */
function refreshDataPreview() {
  const list = document.getElementById('question-list');
  if (!list) return;

  const filteredQuestions = searchQuery
    ? questions.filter(q => {
        const text = `${q.word} ${q.q} ${q.romaji} ${q.translation || ''}`.toLowerCase();
        return text.includes(searchQuery);
      })
    : questions;

  document.getElementById('current-count').textContent = filteredQuestions.length;

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

/* ── FIREBASE CONFIG ── */
function loadFirebaseConfig() {
  const stored = localStorage.getItem('jq_firebase_config');
  if (stored) {
    try {
      const config = JSON.parse(stored);
      return {
        apiKey: config.apiKey || '',
        authDomain: config.authDomain || '',
        projectId: config.projectId || '',
        storageBucket: config.storageBucket || '',
        messagingSenderId: config.messagingSenderId || '',
        appId: config.appId || '',
        measurementId: config.measurementId || ''
      };
    } catch (e) {
      return null;
    }
  }
  return null;
}

function saveFirebaseConfig() {
  const projectId = document.getElementById('firebase-project-id').value.trim();

  if (!projectId) {
    showToast('❌ Please fill in Project ID', 'err');
    return;
  }

  const config = {
    apiKey: document.getElementById('firebase-api-key').value.trim(),
    authDomain: document.getElementById('firebase-auth-domain').value.trim(),
    projectId: projectId,
    storageBucket: document.getElementById('firebase-bucket').value.trim(),
    messagingSenderId: document.getElementById('firebase-messaging-sender-id').value.trim(),
    appId: document.getElementById('firebase-app-id').value.trim(),
    measurementId: document.getElementById('firebase-measurement-id').value.trim()
  };
  
  localStorage.setItem('jq_firebase_config', JSON.stringify(config));
  
  const initialized = initializeFirebase(config);
  if (initialized) {
    showToast('✅ Firebase config saved!', 'ok');
    document.getElementById('firebase-config-panel').classList.add('hidden');
    showFirebaseSetsButton(true);
  } else {
    showToast('❌ Failed to initialize Firebase', 'err');
  }
}

function showFirebaseSetsButton(show) {
  const btn = document.getElementById('btn-firebase-sets');
  if (btn) {
    if (show) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
  }
}

function toggleFirebaseConfig() {
  const panel = document.getElementById('firebase-config-panel');
  panel.classList.toggle('hidden');
  
  const config = loadFirebaseConfig();
  if (config) {
    document.getElementById('firebase-project-id').value = config.projectId || '';
    document.getElementById('firebase-bucket').value = config.storageBucket || '';
    document.getElementById('firebase-api-key').value = config.apiKey || '';
    document.getElementById('firebase-auth-domain').value = config.authDomain || '';
    document.getElementById('firebase-messaging-sender-id').value = config.messagingSenderId || '';
    document.getElementById('firebase-app-id').value = config.appId || '';
    document.getElementById('firebase-measurement-id').value = config.measurementId || '';
  }
}

async function testFirebaseConnection() {
  const config = loadFirebaseConfig();
  if (!config || !config.projectId) {
    showToast('❌ Please configure Firebase first', 'err');
    return;
  }

  const initialized = initializeFirebase(config);
  if (!initialized) {
    showToast('❌ Failed to initialize Firebase', 'err');
    return;
  }

  try {
    const db = getFirestore();
    await db.collection('question-sets').limit(1).get();
    showToast('✅ Connection successful!', 'ok');
  } catch (e) {
    showToast('❌ Connection failed: ' + e.message, 'err');
  }
}

function sanitizeFileName(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function updateCopyButtonState() {
  const set = getActiveQuestionSet();
  const btn = document.getElementById('btn-copy-link');
  if (set && set.firestoreId) {
    btn.disabled = false;
  } else {
    btn.disabled = true;
  }
}

async function backupQuestionSet() {
  const config = loadFirebaseConfig();
  if (!config || !config.projectId) {
    showToast('❌ Please configure Firebase first', 'err');
    toggleFirebaseConfig();
    return;
  }

  if (!isOnline()) {
    showToast('❌ No internet connection. Please check your network.', 'err');
    return;
  }

  const activeSet = getActiveQuestionSet();
  if (!activeSet || !activeSet.questions || activeSet.questions.length === 0) {
    showToast('❌ Cannot backup empty question set', 'err');
    return;
  }

  try {
    const initialized = initializeFirebase(config);
    if (!initialized) {
      throw new Error('Failed to initialize Firebase');
    }

    const networkEnabled = await ensureNetwork();
    if (!networkEnabled) {
      throw new Error('Cannot connect to Firebase. Please check your internet connection.');
    }

    const db = getFirestore();
    if (!db) {
      throw new Error('Failed to get Firestore');
    }

    const docRef = await db.collection('question-sets').add({
      name: activeSet.name,
      questions: activeSet.questions,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    activeSet.firestoreId = docRef.id;
    activeSet.updatedAt = new Date().toISOString();
    saveQuestionSetsToStorage();
    
    refreshQuestionSetUI();
    showToast('✅ Backup successful!', 'ok');
  } catch (e) {
    showToast('❌ Backup failed: ' + e.message, 'err');
  }
}

async function copyFirestoreId() {
  const activeSet = getActiveQuestionSet();
  if (!activeSet || !activeSet.firestoreId) {
    showToast('❌ No backup ID available', 'err');
    return;
  }

  try {
    await navigator.clipboard.writeText(activeSet.firestoreId);
    showToast('📋 ID copied!', 'ok');
  } catch (e) {
    showToast('❌ Failed to copy: ' + e.message, 'err');
  }
}

function validateFirestoreId(id) {
  if (!id || typeof id !== 'string') {
    return { valid: false, error: 'ID is empty' };
  }
  
  id = id.trim();
  
  if (id.length < 20) {
    return { valid: false, error: 'Invalid document ID format' };
  }
  
  if (!/^[a-zA-Z0-9]+$/.test(id)) {
    return { valid: false, error: 'Invalid document ID format' };
  }
  
  return { valid: true, id };
}

function parseFirestoreData(data) {
  if (!data || !data.questions || !Array.isArray(data.questions)) {
    throw new Error('Invalid question set data');
  }
  
  const questions = data.questions;
  
  if (questions.length === 0) {
    throw new Error('Question set is empty');
  }
  
  questions.forEach((item, i) => {
    if (!item.word || !item.q || !Array.isArray(item.a) || item.c === undefined || !item.romaji) {
      throw new Error(`Item ${i} is missing required fields`);
    }
  });
  
  return { questions, name: data.name || 'Imported Set' };
}

async function importFromFirestore() {
  const idInput = document.getElementById('import-url-input');
  const docId = idInput.value.trim();
  
  const validation = validateFirestoreId(docId);
  if (!validation.valid) {
    showToast('❌ ' + validation.error, 'err');
    return;
  }

  if (!isOnline()) {
    showToast('❌ No internet connection. Please check your network.', 'err');
    return;
  }

  try {
    const config = loadFirebaseConfig();
    if (!config || !config.projectId) {
      throw new Error('Please configure Firebase first');
    }

    const initialized = initializeFirebase(config);
    if (!initialized) {
      throw new Error('Failed to initialize Firebase');
    }

    const networkEnabled = await ensureNetwork();
    if (!networkEnabled) {
      throw new Error('Cannot connect to Firebase. Please check your internet connection.');
    }

    const db = getFirestore();
    const docRef = db.collection('question-sets').doc(validation.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error('Document not found');
    }

    const data = docSnap.data();
    const { questions, name } = parseFirestoreData(data);
    
    promptForSetName(name, (setName) => {
      const now = new Date().toISOString();
      const newSet = {
        id: 'set-' + Date.now(),
        name: setName,
        questions: questions,
        createdAt: now,
        updatedAt: now,
        firestoreId: validation.id
      };
      
      questionSets.push(newSet);
      activeSetId = newSet.id;
      syncQuestionsFromActiveSet();
      saveToStorage();
      
      idInput.value = '';
      refreshQuestionSetUI();
      refreshDataPreview();
      updateMenuUI();
      updateCopyButtonState();
      
      showToast(`✅ Imported ${questions.length} questions!`, 'ok');
    });
    
  } catch (e) {
    showToast('❌ Import failed: ' + e.message, 'err');
  }
}

function toggleImportMode() {
  const urlRadio = document.getElementById('import-url');
  const input = document.getElementById('import-url-input');
  
  if (urlRadio.checked) {
    importMode = 'url';
    input.placeholder = 'Paste JSON URL here...';
  } else {
    importMode = 'id';
    input.placeholder = 'Paste Firestore document ID here...';
  }
}

function handleGetButton() {
  const input = document.getElementById('import-url-input').value.trim();
  
  if (!input) {
    showToast('❌ Please enter a value', 'err');
    return;
  }
  
  if (importMode === 'url') {
    importFromGenericUrl();
  } else {
    importFromFirestore();
  }
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

function isFirestoreResponse(data) {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return parsed.fields && parsed.fields.questions && parsed.fields.questions.arrayValue;
  } catch {
    return false;
  }
}

function parseFirestoreRestResponse(data) {
  const parsed = typeof data === 'string' ? JSON.parse(data) : data;
  
  if (!parsed.fields || !parsed.fields.questions) {
    throw new Error('Invalid Firestore response structure');
  }
  
  const questionsArray = parsed.fields.questions.arrayValue;
  if (!questionsArray || !questionsArray.values) {
    throw new Error('No questions in Firestore document');
  }
  
  const questions = questionsArray.values.map((item, i) => {
    if (!item.mapValue || !item.mapValue.fields) {
      throw new Error(`Item ${i} has invalid structure`);
    }
    
    const fields = item.mapValue.fields;
    return {
      word: fields.word?.stringValue,
      romaji: fields.romaji?.stringValue,
      translation: fields.translation?.stringValue,
      q: fields.q?.stringValue,
      a: fields.a?.arrayValue?.values?.map(v => v.stringValue) || [],
      c: parseInt(fields.c?.integerValue || '0', 10),
      ex: fields.ex?.stringValue
    };
  });
  
  if (questions.length === 0) {
    throw new Error('Question array is empty');
  }
  
  return questions;
}

function parseGenericJson(data) {
  if (!data) {
    throw new Error('Empty response from URL');
  }
  
  const parsed = typeof data === 'string' ? JSON.parse(data) : data;
  
  if (isFirestoreResponse(parsed)) {
    return parseFirestoreRestResponse(parsed);
  }
  
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
    showToast('❌ Import cancelled', 'err');
    return null;
  }
  return callback(name.trim());
}

async function importFromGenericUrl() {
  const urlInput = document.getElementById('import-url-input');
  const url = urlInput.value.trim();
  
  const validation = validateGenericUrl(url);
  if (!validation.valid) {
    showToast('❌ ' + validation.error, 'err');
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
      
      showToast(`✅ Imported ${questions.length} questions!`, 'ok');
    });
    
  } catch (e) {
    showToast('❌ Import failed: ' + e.message, 'err');
  }
}

function generateFirestoreUrl(docId) {
  const config = loadFirebaseConfig();
  if (!config || !config.projectId) {
    return null;
  }
  
  const projectId = config.projectId;
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/question-sets/${docId}`;
}

function copyButtonHandler() {
  const activeSet = getActiveQuestionSet();
  
  if (!activeSet || !activeSet.firestoreId) {
    showToast('❌ Question set not backed up', 'err');
    return;
  }
  
  const config = loadFirebaseConfig();
  if (!config || !config.projectId) {
    showToast('❌ Please configure Firebase first', 'err');
    return;
  }
  
  const url = generateFirestoreUrl(activeSet.firestoreId);
  if (url) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('📋 URL copied!', 'ok');
    }).catch(e => {
      showToast('❌ Failed to copy: ' + e.message, 'err');
    });
  }
}
