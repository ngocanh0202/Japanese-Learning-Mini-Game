const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'data-manager.js'), 'utf8');

function createContext() {
  const importExportToggles = [];
  const elements = {
    'question-list': { innerHTML: '' },
    'current-count': { textContent: '' },
    'question-search': { value: '' },
    'import-export-card': { classList: { toggle(name, value) { importExportToggles.push({ name, value }); } } },
    'question-edit-modal': { classList: { remove(name) { calls.push({ type: 'modal-open', name }); }, add() {} } },
    'question-edit-word': { value: '', focus() {} },
    'question-edit-romaji': { value: '' },
    'question-edit-translation': { value: '' },
    'question-edit-prompt': { value: '' },
    'question-edit-answers': { value: '' },
    'question-edit-correct': { value: '' },
    'question-edit-example': { value: '' }
  };
  const calls = [];
  const context = {
    console,
    dataPage: 1,
    searchQuery: '',
    questions: [],
    getActiveQuestionSet() {
      return {
        id: 'server-set-1',
        serverId: 'set-1',
        name: 'Server Set',
        question_count: 6,
        canEdit: true
      };
    },
    isNAServerConfigured() {
      return true;
    },
    async loadQuestionSetPageFromNAServer(id, page, pageSize, query) {
      calls.push({ id, page, pageSize, query });
      return {
        questions: [
          { id: 'q-1', word: 'gakusei', q: 'Meaning?', romaji: 'gakusei', translation: 'student' },
          { id: 'q-2', word: 'sensei', q: 'Meaning?', romaji: 'sensei', translation: 'teacher' }
        ],
        pagination: { page, page_size: pageSize, total: 6, page_count: 3 }
      };
    },
    document: {
      getElementById(id) {
        return elements[id] || null;
      }
    },
    escapeHtml(value) {
      return String(value);
    },
    clearTimeout,
    setTimeout(fn) {
      fn();
      return 1;
    },
    showToast() {},
    saveToStorage() {},
    refreshQuestionSetUI() {},
    updateMenuUI() {},
    setStatus() {},
    SAMPLE_DATA: []
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, elements, calls, importExportToggles };
}

(async () => {
  const { context, elements, calls, importExportToggles } = createContext();

  await vm.runInContext('refreshDataPreview()', context);

  assert.deepStrictEqual(calls[0], { id: 'server-set-1', page: 1, pageSize: 4, query: '' });
  assert.strictEqual(elements['current-count'].textContent, '6');
  assert.strictEqual(elements['question-list'].innerHTML.includes('gakusei'), true);
  assert.strictEqual(elements['question-list'].innerHTML.includes('Page 1 / 3'), true);
  assert.strictEqual(elements['question-list'].innerHTML.includes('Source'), true);
  assert.strictEqual(elements['question-list'].innerHTML.includes('Server'), true);
  assert.strictEqual(elements['question-list'].innerHTML.includes('editQuestion'), true);
  assert.strictEqual(elements['question-list'].innerHTML.includes('deleteQuestion'), true);
  assert.strictEqual(elements['question-list'].innerHTML.includes('addQuestion'), true);
  assert.deepStrictEqual(importExportToggles.find(item => item.name === 'hidden'), { name: 'hidden', value: true });

  await vm.runInContext('setDataPage(2)', context);

  assert.deepStrictEqual(calls[1], { id: 'server-set-1', page: 2, pageSize: 4, query: '' });

  elements['question-search'].value = 'sensei';
  vm.runInContext('updateQuestionSearch()', context);
  await Promise.resolve();

  assert.deepStrictEqual(calls[2], { id: 'server-set-1', page: 1, pageSize: 4, query: 'sensei' });

  vm.runInContext('addQuestion()', context);
  assert.deepStrictEqual(calls.at(-1), { type: 'modal-open', name: 'hidden' });
  assert.strictEqual(elements['question-edit-word'].value, '');
  assert.strictEqual(elements['question-edit-answers'].value.split('\n').length, 4);

  console.log('server question list tests passed');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
