const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'storage.js'), 'utf8');

function createContext() {
  const storage = new Map();
  const createClassList = () => ({
    values: new Set(),
    add(value) { this.values.add(value); },
    remove(value) { this.values.delete(value); },
    toggle(value, force) {
      if (force) {
        this.add(value);
      } else {
        this.remove(value);
      }
    },
    contains(value) { return this.values.has(value); }
  });
  const elements = {
    'question-set-selector': { value: '', innerHTML: '' },
    'active-set-name': { textContent: '' },
    'current-count': { textContent: '' },
    'btn-rename-set': { disabled: false },
    'btn-delete-set': { disabled: false },
    'btn-share-set': { disabled: false, classList: createClassList() },
    'btn-pull-active': { disabled: false, classList: createClassList() },
    'btn-push-active': { disabled: false, classList: createClassList() },
    'share-set-modal': { classList: { removed: [], added: [], remove(value) { this.removed.push(value); }, add(value) { this.added.push(value); } } },
    'share-user-search': { value: 'stale', focusCalled: false, focus() { this.focusCalled = true; } },
    'share-permission': { value: 'edit' },
    'share-user-list': { innerHTML: '' }
  };

  const context = {
    console,
    localStorage: {
      getItem(key) {
        return storage.has(key) ? storage.get(key) : null;
      },
      setItem(key, value) {
        storage.set(key, String(value));
      },
      removeItem(key) {
        storage.delete(key);
      }
    },
    document: {
      getElementById(id) {
        return elements[id] || null;
      }
    },
    prompt() {
      return 'Renamed Set';
    },
    async showConfirmDialog() {
      return true;
    },
    alert(message) {
      throw new Error(`Unexpected alert: ${message}`);
    },
    showToast() {},
    refreshDataPreview() {},
    updateMenuUI() {},
    normalizePlayerProgress() {},
    saveDailyStreak() {},
    generateQuestionId(question, index) {
      return question.id || question.word || `question-${index}`;
    },
    getScopedQuestionId(id) {
      return id;
    },
    getDefaultQuestionTypeStats() {
      return {};
    },
    escapeHtml(value) {
      return String(value);
    },
    setHidden(element, hidden) {
      element.classList.toggle('hidden', hidden);
    },
    isNAServerConfigured() {
      return false;
    },
    SAMPLE_DATA: [],
    questions: [],
    questionSets: [],
    activeSetId: null,
    questionStats: {},
    playerHP: 100,
    playerEXP: 0,
    playerLevel: 1,
    playerCombo: 0,
    settings: {}
  };

  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, elements };
}

(async () => {
  {
    const { context, elements } = createContext();
    context.questionSets = [
      { id: 'set-a', name: 'Set A', questions: [{ word: 'a' }] },
      { id: 'set-b', name: 'Set B', questions: [{ word: 'b' }] }
    ];
    context.activeSetId = 'set-a';
    elements['question-set-selector'].value = 'set-b';

    vm.runInContext('promptRenameQuestionSet()', context);

    assert.strictEqual(context.questionSets[0].name, 'Set A');
    assert.strictEqual(context.questionSets[1].name, 'Renamed Set');
  }

  {
    const { context, elements } = createContext();
    context.questionSets = [
      { id: 'set-a', name: 'Set A', questions: [{ word: 'a' }] },
      { id: 'set-b', name: 'Set B', questions: [{ word: 'b' }] }
    ];
    context.activeSetId = 'set-a';
    elements['question-set-selector'].value = 'set-b';

    await vm.runInContext('deleteActiveQuestionSet()', context);

    assert.strictEqual(JSON.stringify(context.questionSets.map(set => set.id)), JSON.stringify(['set-a']));
    assert.strictEqual(context.activeSetId, 'set-a');
    assert.strictEqual(JSON.stringify(context.questions), JSON.stringify([{ word: 'a' }]));
  }

  {
    const { context, elements } = createContext();
    context.questionSets = [
      { id: 'set-only', name: 'Only Set', questions: [{ word: 'only' }] }
    ];
    context.activeSetId = 'set-only';
    context.questions = [{ word: 'only' }];
    elements['question-set-selector'].value = 'set-only';

    await vm.runInContext("deleteQuestionSet('set-only')", context);

    assert.strictEqual(JSON.stringify(context.questionSets), JSON.stringify([]));
    assert.strictEqual(context.activeSetId, null);
    assert.strictEqual(JSON.stringify(context.questions), JSON.stringify([]));
    assert.strictEqual(elements['active-set-name'].textContent, 'No active set');
    assert.strictEqual(elements['current-count'].textContent, '0');
    assert.strictEqual(elements['btn-rename-set'].disabled, true);
    assert.strictEqual(elements['btn-delete-set'].disabled, true);
  }

  {
    const { context, elements } = createContext();
    let deletedId = null;
    context.questionSets = [
      { id: 'set-local', serverId: 'server-1', name: 'Pushed Set', questions: [{ word: 'pushed' }] }
    ];
    context.activeSetId = 'set-local';
    elements['question-set-selector'].value = 'set-local';
    context.deleteQuestionSetOnNAServer = async id => {
      deletedId = id;
    };

    await vm.runInContext("deleteQuestionSet('set-local')", context);

    assert.strictEqual(deletedId, 'set-local');
    assert.strictEqual(context.questionSets.length, 1);
  }

  {
    const { context } = createContext();
    const calls = [];
    context.questionSets = [
      { id: 'server-set-1', serverId: 'set-1', name: 'Server Set', serverOnly: true, questions: [] }
    ];
    context.activeSetId = 'server-set-1';
    context.isNAServerConfigured = () => true;
    context.setNAServerBusy = (busy, label, percent) => calls.push({ type: 'busy', busy, label, percent });
    context.setActiveQuestionSetOnNAServer = async id => calls.push({ type: 'setActive', id });
    context.loadActiveSetFromNAServer = async () => {
      calls.push({ type: 'loadActive' });
      context.questions = [{ word: '学生', q: 'Meaning?' }];
    };

    await vm.runInContext("switchQuestionSet('server-set-1')", context);

    assert.deepStrictEqual(calls.filter(call => call.type === 'setActive'), [{ type: 'setActive', id: 'server-set-1' }]);
    assert.deepStrictEqual(calls.filter(call => call.type === 'loadActive'), [{ type: 'loadActive' }]);
    assert.strictEqual(JSON.stringify(context.questions), JSON.stringify([{ word: '学生', q: 'Meaning?' }]));
  }

  {
    const { context, elements } = createContext();
    context.questionSets = [
      { id: 'local-1', name: 'Draft Local', questions: [{ word: 'local-word' }] },
      { id: 'server-set-1', serverId: 'set-1', name: 'Server Set', serverOnly: true, questions: [] }
    ];
    context.activeSetId = 'local-1';
    context.questions = [{ word: 'local-word' }];
    context.isNAServerConfigured = () => true;
    context.setNAServerBusy = () => {};
    context.setActiveQuestionSetOnNAServer = async () => {};
    context.loadActiveSetFromNAServer = async () => {
      context.questions = [{ word: 'server-word' }];
    };

    await vm.runInContext("switchQuestionSet('server-set-1')", context);
    await vm.runInContext("switchQuestionSet('local-1')", context);
    vm.runInContext('refreshQuestionSetUI()', context);

    assert.strictEqual(JSON.stringify(context.questions), JSON.stringify([{ word: 'local-word' }]));
    assert.strictEqual(elements['question-set-selector'].innerHTML.includes('Draft Local * (local)'), true);
    assert.strictEqual(elements['question-set-selector'].innerHTML.includes('Server Set'), true);
  }

  {
    const { context } = createContext();
    const toasts = [];
    context.questionSets = [
      { id: 'local-1', name: 'Draft Local', questions: [{ word: 'local-word' }] },
      { id: 'server-set-1', serverId: 'set-1', name: 'Server Set', serverOnly: true, questions: [] }
    ];
    context.activeSetId = 'local-1';
    context.questions = [{ word: 'local-word' }];
    context.isNAServerConfigured = () => true;
    context.showToast = message => toasts.push(message);
    context.setNAServerBusy = () => {};
    context.setActiveQuestionSetOnNAServer = async () => {
      throw new Error('Server rejected active set');
    };
    context.loadActiveSetFromNAServer = async () => {
      context.questions = [{ word: 'server-word' }];
    };

    await vm.runInContext("switchQuestionSet('server-set-1')", context);

    assert.strictEqual(context.activeSetId, 'local-1');
    assert.strictEqual(JSON.stringify(context.questions), JSON.stringify([{ word: 'local-word' }]));
    assert.strictEqual(toasts.at(-1), 'Switch set failed: Server rejected active set');
  }

  {
    const { context, elements } = createContext();
    const calls = [];
    context.questionSets = [
      {
        id: 'set-local-server',
        serverId: 'set-1',
        name: 'Pushed Server Set',
        questions: [],
        canShare: true,
        canEdit: true,
        canDelete: true
      }
    ];
    context.activeSetId = 'set-local-server';
    context.isNAServerConfigured = () => true;
    context.loadShareUsers = async () => calls.push('loadShareUsers');

    vm.runInContext('refreshQuestionSetUI()', context);
    await vm.runInContext('promptShareQuestionSet()', context);

    assert.strictEqual(elements['btn-share-set'].disabled, false);
    assert.strictEqual(elements['share-set-modal'].classList.removed.includes('hidden'), true);
    assert.strictEqual(elements['share-user-search'].value, '');
    assert.strictEqual(elements['share-permission'].value, 'view');
    assert.deepStrictEqual(calls, ['loadShareUsers']);
  }

    {
      const { context, elements } = createContext();
      context.questionSets = [
        { id: 'local-only', name: 'Local Only', questions: [{ word: 'local' }] },
        { id: 'server-backed', serverId: 'set-1', name: 'Already Server', questions: [{ word: 'server' }] }
    ];
    context.isNAServerConfigured = () => true;

      context.activeSetId = 'local-only';
      vm.runInContext('refreshQuestionSetUI()', context);
      assert.strictEqual(elements['btn-push-active'].disabled, false);
      assert.strictEqual(elements['btn-push-active'].classList.contains('hidden'), false);
      assert.strictEqual(elements['btn-share-set'].disabled, true);
      assert.strictEqual(elements['btn-share-set'].classList.contains('hidden'), true);
      assert.strictEqual(elements['btn-pull-active'].classList.contains('hidden'), true);

      context.activeSetId = 'server-backed';
      vm.runInContext('refreshQuestionSetUI()', context);
      assert.strictEqual(elements['btn-push-active'].disabled, true);
      assert.strictEqual(elements['btn-push-active'].classList.contains('hidden'), true);
      assert.strictEqual(elements['btn-pull-active'].classList.contains('hidden'), false);
    }

    {
      const { context, elements } = createContext();
      context.questionSets = [
        { id: 'shared-server', serverId: 'set-1', name: 'Shared Server', serverOnly: true, canShare: false, questions: [] }
      ];
      context.activeSetId = 'shared-server';
      context.isNAServerConfigured = () => true;

      vm.runInContext('refreshQuestionSetUI()', context);

      assert.strictEqual(elements['btn-share-set'].classList.contains('hidden'), false);
      assert.strictEqual(elements['btn-share-set'].disabled, true);
    }

    {
      const { context, elements } = createContext();
      context.questionSets = [
        { id: 'local-only', name: 'Local Only', questions: [{ word: 'local' }] }
      ];
      context.activeSetId = 'local-only';
      context.isNAServerConfigured = () => false;

      vm.runInContext('refreshQuestionSetUI()', context);

      assert.strictEqual(elements['btn-push-active'].disabled, true);
      assert.strictEqual(elements['btn-push-active'].classList.contains('hidden'), true);
      assert.strictEqual(elements['btn-share-set'].classList.contains('hidden'), true);
      assert.strictEqual(elements['btn-pull-active'].classList.contains('hidden'), true);
    }

  {
    const { context, elements } = createContext();
    context.searchJapaneseGameUsersOnNAServer = async () => ({
      users: [
        { id: 'self', email: 'me@example.com', role: 'user', approval_status: 'approved', is_current_user: true },
        { id: 'other', email: 'other@example.com', role: 'user', approval_status: 'approved' }
      ],
      pagination: { page_count: 1 }
    });

    await vm.runInContext('loadShareUsers()', context);

    assert.strictEqual(elements['share-user-list'].innerHTML.includes('me@example.com'), false);
    assert.strictEqual(elements['share-user-list'].innerHTML.includes('other@example.com'), true);
    assert.strictEqual(vm.runInContext('currentShareUsers.map(user => user.id).join(",")', context), 'other');
  }

  console.log('question set management tests passed');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
