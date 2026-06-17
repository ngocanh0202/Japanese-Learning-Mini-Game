const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'naserver-api.js'), 'utf8');

let storedConfig = null;
let confirmResult = true;
const calls = [];

const context = {
  console,
  URLSearchParams,
  setTimeout(callback) {
    callback();
    return 1;
  },
  localStorage: {
    getItem(key) {
      if (key === 'jq_naserver_config') return storedConfig;
      return null;
    },
    setItem(key, value) {
      if (key === 'jq_naserver_config') storedConfig = value;
    },
    removeItem(key) {
      if (key === 'jq_naserver_config') storedConfig = null;
    }
  },
  document: {
    getElementById(id) {
      if (id === 'storage-provider-mode') return { value: 'naserver' };
      if (id === 'naserver-email') return { value: 'saved@example.com', textContent: '', classList: { add() {}, remove() {} } };
      if (id === 'naserver-password') return { value: 'saved-password', textContent: '', classList: { add() {}, remove() {} } };
      if (id === 'naserver-password-confirm') return { value: 'saved-password', textContent: '', classList: { add() {}, remove() {} } };
      if (id === 'naserver-account-status') return { textContent: '', classList: { add() {}, remove() {} } };
      if (id === 'naserver-auth-panel') return { classList: { add() {}, remove() {} } };
      return null;
    }
  },
  showToast(message, type) {
    calls.push({ type: 'toast', message, toastType: type });
  },
  async showConfirmDialog(config) {
    calls.push({ type: 'confirm', config });
    return confirmResult;
  },
  saveQuestionSetsToStorage() {
    calls.push({ type: 'saveQuestionSetsToStorage' });
  },
  refreshQuestionSetUI() {
    calls.push({ type: 'refreshQuestionSetUI' });
  },
  refreshDataPreview() {
    calls.push({ type: 'refreshDataPreview' });
  },
  updateMenuUI() {
    calls.push({ type: 'updateMenuUI' });
  },
  initQuestionStats(items) {
    calls.push({ type: 'initQuestionStats', count: items.length });
  },
  SAMPLE_DATA: [{ word: 'example', q: 'Example?', a: ['Example'], c: 0 }],
  questionSets: [],
  activeSetId: null,
  questions: [],
  fetch: async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/api/japanese-learning-game/auth/login')) {
      return {
        ok: true,
        json: async () => ({ access_token: 'token-123', refresh_token: 'refresh-123' })
      };
    }
    if (url.endsWith('/api/japanese-learning-game/auth/register')) {
      return {
        ok: true,
        json: async () => ({ email: 'new@example.com', approval_status: 'pending' })
      };
    }
    return {
      ok: true,
      json: async () => ({ id: 'set1', name: 'Server Set', questions: [] })
    };
  }
};

vm.createContext(context);
vm.runInContext(source, context);

(async () => {
  const config = vm.runInContext('loadNAServerConfig()', context);
  assert.strictEqual(config.provider, 'naserver');
  assert.strictEqual(config.baseUrl, 'http://127.0.0.1:8000');
  assert.strictEqual(config.token, '');
  assert.strictEqual(vm.runInContext('isNAServerConfigured()', context), false);

  await vm.runInContext("loginNAServerAccount('user@example.com', 'secret')", context);
  assert.strictEqual(calls[0].url, 'http://127.0.0.1:8000/api/japanese-learning-game/auth/login');
  assert.deepStrictEqual(JSON.parse(calls[0].options.body), { email: 'user@example.com', password: 'secret' });
  assert.strictEqual(JSON.parse(storedConfig).token, 'token-123');
  assert.strictEqual(JSON.parse(storedConfig).email, 'user@example.com');
  assert.strictEqual(vm.runInContext('isNAServerConfigured()', context), true);
  assert.strictEqual(calls.some(call => call.url && call.options?.method === 'POST' && call.url.endsWith('/api/japanese-learning-game/sets')), false);

  await vm.runInContext("requestNAServer('/api/japanese-learning-game/active-set')", context);
  const fetchCalls = calls.filter(call => call.url);
  const activeSetFetch = fetchCalls.find(call => call.url === 'http://127.0.0.1:8000/api/japanese-learning-game/active-set');
  assert.strictEqual(activeSetFetch.options.headers.Authorization, 'Bearer token-123');

  await vm.runInContext("registerNAServerAccount('new@example.com', 'secret')", context);
  assert.strictEqual(calls.filter(call => call.url && call.url.endsWith('/api/japanese-learning-game/auth/register')).length, 1);

  vm.runInContext("setProviderMode('firebase')", context);
  assert.strictEqual(JSON.parse(storedConfig).provider, 'naserver');
  assert.strictEqual(vm.runInContext('isNAServerConfigured()', context), true);

  let registerCallCount = calls.filter(call => call.url && call.url.endsWith('/api/japanese-learning-game/auth/register')).length;
  context.document.getElementById = id => {
    if (id === 'naserver-email') return { value: 'new@example.com', classList: { add() {}, remove() {} } };
    if (id === 'naserver-password') return { value: 'secret-1', classList: { add() {}, remove() {} } };
    if (id === 'naserver-password-confirm') return { value: 'secret-2', classList: { add() {}, remove() {} } };
    return { value: '', textContent: '', classList: { add() {}, remove() {} } };
  };
  await vm.runInContext("registerNAServerFromUI()", context);
  assert.strictEqual(calls.filter(call => call.url && call.url.endsWith('/api/japanese-learning-game/auth/register')).length, registerCallCount);
  assert.strictEqual(calls.at(-1).message, 'Passwords do not match');

  context.document.getElementById = id => {
    if (id === 'naserver-email') return { value: 'new@example.com', classList: { add() {}, remove() {} } };
    if (id === 'naserver-password') return { value: 'secret', classList: { add() {}, remove() {} } };
    if (id === 'naserver-password-confirm') return { value: 'secret', classList: { add() {}, remove() {} } };
    return { value: '', textContent: '', classList: { add() {}, remove() {} } };
  };
  await vm.runInContext("registerNAServerFromUI()", context);
  assert.strictEqual(calls.at(-1).message, 'Registration submitted. Account is pending admin approval.');

  storedConfig = JSON.stringify({ provider: 'naserver', baseUrl: 'http://127.0.0.1:8000', token: 'token-123' });
  context.questionSets = [
    { id: 'server-set1', serverId: 'set1', name: 'Server Set', serverOnly: true, updatedAt: '2026-06-03T01:02:03' }
  ];
  context.activeSetId = 'server-set1';
  context.questions = [{ word: 'stale' }];
  context.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => []
    };
  };

  const refreshed = await vm.runInContext('refreshQuestionSetsFromNAServer()', context);
  assert.strictEqual(JSON.stringify(refreshed), JSON.stringify([]));
  assert.strictEqual(JSON.stringify(context.questionSets), JSON.stringify([]));
  assert.strictEqual(context.activeSetId, null);
  assert.strictEqual(JSON.stringify(context.questions), JSON.stringify([]));

  vm.runInContext(`
    questionSets = [
      { id: 'local-draft', name: 'Local Draft', questions: [{ word: 'draft' }] }
    ];
    activeSetId = 'local-draft';
    questions = [{ word: 'draft' }];
  `, context);
  context.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ([{
        id: 'server-1',
        name: 'Server One',
        question_count: 2,
        updated_at: '2026-06-03T01:02:03',
        can_edit: true,
        can_delete: true,
        can_share: true
      }])
    };
  };
  await vm.runInContext('refreshQuestionSetsFromNAServer()', context);
  assert.strictEqual(JSON.stringify(context.questionSets.map(set => set.id)), JSON.stringify(['server-server-1']));
  assert.strictEqual(JSON.stringify(context.questions), JSON.stringify([]));
  assert.strictEqual(context.activeSetId, 'server-server-1');

  calls.length = 0;
  confirmResult = false;
  context.fetch = async () => {
    throw new Error('Pull should not call NAServer when canceled');
  };
  await vm.runInContext('pullActiveSetFromNAServer()', context);
  assert.strictEqual(calls.filter(call => call.type === 'confirm').length, 1);
  assert.strictEqual(JSON.stringify(context.questionSets.map(set => set.id)), JSON.stringify(['server-server-1']));

  calls.length = 0;
  confirmResult = true;
  context.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ([{
        id: 'server-2',
        name: 'Server Two',
        question_count: 3,
        updated_at: '2026-06-03T02:02:03',
        is_active: true,
        can_edit: true,
        can_delete: true,
        can_share: true
      }])
    };
  };
  await vm.runInContext('pullActiveSetFromNAServer()', context);
  assert.strictEqual(calls.filter(call => call.type === 'confirm').length, 1);
  assert.strictEqual(calls.filter(call => call.url && call.url.endsWith('/api/japanese-learning-game/sets')).length, 1);
  assert.strictEqual(JSON.stringify(context.questionSets.map(set => set.id)), JSON.stringify(['server-server-2']));
  assert.strictEqual(context.activeSetId, 'server-server-2');
  assert.strictEqual(JSON.stringify(context.questions), JSON.stringify([]));

  context.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/api/japanese-learning-game/start')) {
      return {
        ok: true,
        json: async () => ({ questions: [{ id: 'q-1', word: '学生', a: ['student'], c: 0 }] })
      };
    }
    if (url.endsWith('/api/japanese-learning-game/questions')) {
      return {
        ok: true,
        json: async () => ({})
      };
    }
    return {
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Not Found' })
    };
  };

  await vm.runInContext("startServerGame('quiz')", context);
  const gameStartCall = calls.filter(call => call.url).at(-2);
  assert.strictEqual(gameStartCall.url, 'http://127.0.0.1:8000/api/japanese-learning-game/start');
  assert.strictEqual(JSON.stringify(context.questions), JSON.stringify([{ id: 'q-1', word: '学生', a: ['student'], c: 0 }]));

  context.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/api/japanese-learning-game/start')) {
      return {
        ok: true,
        json: async () => ({
          session_id: 'session-1',
          game_type: 'quiz',
          current_index: 0,
          total: 2,
          current_question: { id: 'q-1', word: 'student', a: ['student'] },
          state: {
            session_id: 'session-1',
            game_type: 'quiz',
            current_index: 0,
            total: 2,
            current_question: { id: 'q-1', word: 'student', a: ['student'] }
          }
        })
      };
    }
    if (url.endsWith('/api/japanese-learning-game/questions')) {
      return {
        ok: true,
        json: async () => ({})
      };
    }
    return {
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Not Found' })
    };
  };
  await vm.runInContext("startServerGame('quiz')", context);
  assert.strictEqual(JSON.stringify(context.questions), JSON.stringify([{ id: 'q-1', word: 'student', a: ['student'] }]));

  context.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ({
        session_id: 'session-1',
        game_type: 'quiz',
        current_index: 1,
        total: 2,
        current_question: { id: 'q-2', word: 'teacher', a: ['teacher'] },
        current_answered: false,
        state: {
          session_id: 'session-1',
          game_type: 'quiz',
          current_index: 1,
          total: 2,
          current_question: { id: 'q-2', word: 'teacher', a: ['teacher'] },
          current_answered: false
        }
      })
    };
  };
  await vm.runInContext('nextServerGameQuestion()', context);
  const nextCall = calls.filter(call => call.url).at(-1);
  assert.strictEqual(nextCall.url, 'http://127.0.0.1:8000/api/japanese-learning-game/next?session_id=session-1');
  assert.strictEqual(nextCall.options.method, 'POST');
  assert.strictEqual(JSON.stringify(context.questions), JSON.stringify([{ id: 'q-2', word: 'teacher', a: ['teacher'] }]));

  let staleNextAttempted = false;
  context.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.includes('/api/japanese-learning-game/next?')) {
      staleNextAttempted = true;
      return {
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Not Found' })
      };
    }
    if (url.endsWith('/api/japanese-learning-game/session?game_type=quiz')) {
      return {
        ok: true,
        json: async () => ({
          session_id: 'session-active',
          game_type: 'quiz',
          current_index: 1,
          total: 2,
          current_question: { id: 'q-active', word: 'active', a: ['active'] },
          state: {
            session_id: 'session-active',
            game_type: 'quiz',
            current_index: 1,
            total: 2,
            current_question: { id: 'q-active', word: 'active', a: ['active'] }
          }
        })
      };
    }
    return {
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Unexpected URL' })
    };
  };
  await vm.runInContext("nextServerGameQuestion('quiz')", context);
  assert.strictEqual(staleNextAttempted, true);
  assert.strictEqual(JSON.stringify(context.questions), JSON.stringify([{ id: 'q-active', word: 'active', a: ['active'] }]));

  let staleAnswerAttempted = false;
  context.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.includes('/api/japanese-learning-game/answer?')) {
      staleAnswerAttempted = true;
      return {
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Session not found' })
      };
    }
    if (url.endsWith('/api/japanese-learning-game/session?game_type=quiz')) {
      return {
        ok: true,
        json: async () => ({
          session_id: 'session-active-answer',
          game_type: 'quiz',
          current_index: 0,
          total: 2,
          current_question: { id: 'q-active-answer', word: 'synced', a: ['synced'] },
          state: {
            session_id: 'session-active-answer',
            game_type: 'quiz',
            current_index: 0,
            total: 2,
            current_question: { id: 'q-active-answer', word: 'synced', a: ['synced'] }
          }
        })
      };
    }
    return {
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Unexpected URL' })
    };
  };
  const staleAnswerResult = await vm.runInContext("submitGameAnswerOnNAServer('q-stale', 0, 1200, 'quiz')", context);
  assert.strictEqual(staleAnswerAttempted, true);
  assert.strictEqual(staleAnswerResult.sync_required, true);
  assert.strictEqual(staleAnswerResult.reason, 'session_not_found');
  assert.strictEqual(JSON.stringify(context.questions), JSON.stringify([{ id: 'q-active-answer', word: 'synced', a: ['synced'] }]));

  context.getFastCorrectThresholdMs = () => 5000;
  context.getScopedQuestionId = id => `server-set::${id}`;
  context.questionStats = {};
  context.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/api/japanese-learning-game/attempt')) {
      return {
        ok: true,
        json: async () => ({
          question_id: 'q-1',
          game_type: 'quiz',
          stats: { correctCount: 1 }
        })
      };
    }
    return {
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Not Found' })
    };
  };

  await vm.runInContext("recordAttemptOnNAServer('server-set::q-1', 'quiz', true, 1200)", context);
  const attemptCall = calls.filter(call => call.url).at(-1);
  assert.strictEqual(attemptCall.url, 'http://127.0.0.1:8000/api/japanese-learning-game/attempt');
  assert.deepStrictEqual(JSON.parse(attemptCall.options.body), {
    question_id: 'q-1',
    game_type: 'quiz',
    correct: true,
    response_time_ms: 1200,
    fast_correct: true
  });
  assert.strictEqual(JSON.stringify(context.questionStats['server-set::q-1'].quiz), JSON.stringify({ correctCount: 1 }));

  context.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ({ summary: { totalAnswers: 1 }, byGameType: {}, mastery: {}, history: [] })
    };
  };
  const learningStats = await vm.runInContext('loadLearningStatsFromNAServer()', context);
  const learningStatsCall = calls.filter(call => call.url).at(-1);
  assert.strictEqual(learningStatsCall.url, 'http://127.0.0.1:8000/api/japanese-learning-game/overview');
  assert.strictEqual(learningStats.summary.totalAnswers, 1);

  context.questionSets = [
    { id: 'server-set1', serverId: 'set1', name: 'Server Set', serverOnly: true }
  ];
  context.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ({ questions: [], pagination: { total: 0 } })
    };
  };
  await vm.runInContext("loadQuestionSetPageFromNAServer('server-set1', 2, 10, 'sensei')", context);
  const pageCall = calls.filter(call => call.url).at(-1);
  assert.strictEqual(pageCall.url, 'http://127.0.0.1:8000/api/japanese-learning-game/sets/set1?page=2&page_size=10&q=sensei');

  context.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ({ message: 'Updated successfully' })
    };
  };
  vm.runInContext("questionSets = [{ id: 'server-set1', serverId: 'set1', name: 'Server Set', serverOnly: true, updatedAt: '2026-06-03T01:02:03' }]", context);
  await vm.runInContext("updateQuestionOnNAServer('server-set1', 'q-1', { word: 'sensei', romaji: 'sensei', q: 'Meaning?', a: ['teacher'], c: 0 })", context);
  const updateQuestionCall = calls.filter(call => call.url).at(-1);
  assert.strictEqual(updateQuestionCall.url, 'http://127.0.0.1:8000/api/japanese-learning-game/sets/set1/questions/q-1');
  assert.strictEqual(updateQuestionCall.options.method, 'PUT');
  assert.strictEqual(JSON.parse(updateQuestionCall.options.body).word, 'sensei');
  assert.strictEqual(JSON.parse(updateQuestionCall.options.body).expected_updated_at, '2026-06-03T01:02:03');

  await vm.runInContext("deleteQuestionOnNAServer('server-set1', 'q-1')", context);
  const deleteQuestionCall = calls.filter(call => call.url).at(-1);
  assert.strictEqual(deleteQuestionCall.url, 'http://127.0.0.1:8000/api/japanese-learning-game/sets/set1/questions/q-1?expected_updated_at=2026-06-03T01%3A02%3A03');
  assert.strictEqual(deleteQuestionCall.options.method, 'DELETE');

  await vm.runInContext("addQuestionOnNAServer('server-set1', { word: 'nihon', romaji: 'nihon', q: 'Meaning?', a: ['Japan'], c: 0 })", context);
  const addQuestionCall = calls.filter(call => call.url).at(-1);
  assert.strictEqual(addQuestionCall.url, 'http://127.0.0.1:8000/api/japanese-learning-game/sets/set1/questions');
  assert.strictEqual(addQuestionCall.options.method, 'POST');
  assert.strictEqual(JSON.parse(addQuestionCall.options.body).word, 'nihon');

  context.fetch = async (url, options) => {
    calls.push({ url, options });
    if (options?.method === 'PUT') {
      return {
        ok: true,
        json: async () => ({ message: 'Updated successfully' })
      };
    }
    return {
      ok: true,
      json: async () => ({ id: 'set1', name: 'Server Set', questions: [] })
    };
  };
  await vm.runInContext("renameQuestionSetOnNAServer('server-set1', 'Renamed Server')", context);
  const renameCall = calls.filter(call => call.url && call.options?.method === 'PUT').at(-1);
  assert.strictEqual(JSON.parse(renameCall.options.body).expected_updated_at, '2026-06-03T01:02:03');

  vm.runInContext(`
    questionSets = [
      { id: 'local-active', name: 'Local Active', questions: [{ word: 'local' }] },
      { id: 'server-set1', serverId: 'set1', name: 'Old Server', serverOnly: true, updatedAt: '2026-06-03T01:02:03' }
    ];
    activeSetId = 'local-active';
    questions = [{ word: 'local' }];
  `, context);
  context.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/api/japanese-learning-game/sets/set1') && !options?.method) {
      return {
        ok: true,
        json: async () => ({ id: 'set1', name: 'Old Server', questions: [], updated_at: '2026-06-03T01:02:03' })
      };
    }
    if (options?.method === 'PUT') {
      return {
        ok: true,
        json: async () => ({ message: 'Updated successfully', updated_at: '2026-06-03T02:00:00' })
      };
    }
    return {
      ok: true,
      json: async () => ([{
        id: 'set1',
        name: 'Renamed Server',
        question_count: 0,
        updated_at: '2026-06-03T02:00:00',
        is_active: false,
        can_edit: true,
        can_delete: true,
        can_share: true
      }])
    };
  };
  await vm.runInContext("renameQuestionSetOnNAServer('server-set1', 'Renamed Server')", context);
  assert.strictEqual(context.activeSetId, 'server-set1');
  assert.strictEqual(context.questionSets.find(set => set.id === 'server-set1').name, 'Renamed Server');
  assert.strictEqual(JSON.stringify(context.questions), JSON.stringify([]));

  vm.runInContext("questionSets = [{ id: 'server-set1', serverId: 'set1', name: 'Server Set', serverOnly: true, updatedAt: '2026-06-03T01:02:03' }]", context);
  await vm.runInContext("deleteQuestionSetOnNAServer('server-set1')", context);
  const deleteSetCall = calls.filter(call => call.url && call.options?.method === 'DELETE').at(-1);
  assert.strictEqual(deleteSetCall.url, 'http://127.0.0.1:8000/api/japanese-learning-game/sets/set1?expected_updated_at=2026-06-03T01%3A02%3A03');

  context.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ({ users: [{ id: 'u-1', email: 'user@example.com' }], pagination: { total: 1 } })
    };
  };
  await vm.runInContext("searchJapaneseGameUsersOnNAServer('user', 1, 20)", context);
  const userSearchCall = calls.filter(call => call.url).at(-1);
  assert.strictEqual(userSearchCall.url, 'http://127.0.0.1:8000/api/japanese-learning-game/users?q=user&page=1&page_size=20');

  calls.length = 0;
  storedConfig = JSON.stringify({ provider: 'naserver', baseUrl: 'http://127.0.0.1:8000', token: 'token-123' });
  vm.runInContext(`
    questionSets = [
      { id: 'local-to-push', name: 'Local To Push', questions: [{ word: 'local', q: 'Meaning?', a: ['local'], c: 0 }] }
    ];
    activeSetId = 'local-to-push';
    questions = [{ word: 'local', q: 'Meaning?', a: ['local'], c: 0 }];
  `, context);
  context.getActiveQuestionSet = () => context.questionSets.find(set => set.id === context.activeSetId) || null;
  context.updateActiveSetFromQuestions = () => {
    const set = context.questionSets.find(item => item.id === context.activeSetId);
    if (set) set.questions = context.questions;
  };
  context.document.getElementById = id => {
    if (id === 'naserver-backup-label') return { textContent: '' };
    if (id === 'naserver-backup-fill') return { style: { width: '' } };
    if (id === 'naserver-backup-percent') return { textContent: '' };
    return { value: '', textContent: '', classList: { add() {}, remove() {}, toggle() {} } };
  };
  context.document.querySelector = () => ({ setAttribute() {} });
  context.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/api/japanese-learning-game/sets') && options?.method === 'POST') {
      return {
        ok: true,
        json: async () => ({ id: 'pushed-1' })
      };
    }
    if (url.endsWith('/api/japanese-learning-game/active-set?set_id=pushed-1') && options?.method === 'POST') {
      return {
        ok: true,
        json: async () => ({ ok: true })
      };
    }
    if (url.endsWith('/api/japanese-learning-game/sets') && options?.method === 'GET') {
      return {
        ok: true,
        json: async () => ([{
          id: 'pushed-1',
          name: 'Local To Push',
          question_count: 1,
          updated_at: '2026-06-03T03:03:03',
          is_active: true,
          can_edit: true,
          can_delete: true,
          can_share: true
        }])
      };
    }
    return {
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Not Found' })
    };
  };
  await vm.runInContext('backupActiveSetToNAServer()', context);
  assert.strictEqual(calls.some(call => call.url && call.url.endsWith('/api/japanese-learning-game/active-set?set_id=pushed-1')), true);
  assert.strictEqual(context.activeSetId, 'server-pushed-1');
  assert.strictEqual(context.questionSets[0].serverId, 'pushed-1');

  calls.length = 0;
  storedConfig = JSON.stringify({
    provider: 'naserver',
    baseUrl: 'http://127.0.0.1:8000',
    token: 'token-123',
    email: 'user@example.com'
  });
  vm.runInContext(`
    questionSets = [
      { id: 'local-keep', name: 'Local Keep', questions: [{ word: 'local' }] },
      { id: 'server-drop', serverId: 'server-1', name: 'Server Drop', serverOnly: true, questions: [{ word: 'server' }] },
      { id: 'server-pushed', serverId: 'server-2', name: 'Pushed Server', questions: [{ word: 'pushed' }] }
    ];
    activeSetId = 'server-drop';
    questions = [{ word: 'server' }];
  `, context);
  vm.runInContext('logoutNAServerAccount()', context);
  assert.strictEqual(JSON.parse(storedConfig).token, '');
  assert.strictEqual(JSON.parse(storedConfig).email, '');
  assert.strictEqual(JSON.stringify(context.questionSets.map(set => set.id)), JSON.stringify(['set-default']));
  assert.strictEqual(context.activeSetId, 'set-default');
  assert.strictEqual(JSON.stringify(context.questions), JSON.stringify(context.SAMPLE_DATA));
  assert.strictEqual(calls.some(call => call.type === 'refreshQuestionSetUI'), true);
  assert.strictEqual(calls.some(call => call.type === 'refreshDataPreview'), true);

  storedConfig = JSON.stringify({
    provider: 'naserver',
    baseUrl: 'http://127.0.0.1:8000',
    token: 'stale-token',
    email: 'old@example.com'
  });
  context.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Invalid authentication credentials' })
    };
  };
  await assert.rejects(
    vm.runInContext("requestNAServer('/api/japanese-learning-game/sets')", context),
    /NAServer session expired. Please login again./
  );
  assert.strictEqual(JSON.parse(storedConfig).token, '');
  assert.strictEqual(JSON.parse(storedConfig).email, '');

  console.log('naserver api tests passed');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
