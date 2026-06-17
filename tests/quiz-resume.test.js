const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const mainSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');
const storageSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'storage.js'), 'utf8');
const gameUtilsSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'game-utils.js'), 'utf8');
const quizSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'games', 'game-quiz.js'), 'utf8');

function createElement(id) {
  return {
    id,
    textContent: '',
    innerHTML: '',
    style: {},
    children: [],
    dataset: {},
    disabled: false,
    classList: {
      values: new Set(['hidden']),
      add(value) { this.values.add(value); },
      remove(value) { this.values.delete(value); },
      contains(value) { return this.values.has(value); },
      toggle(value, force) {
        const shouldAdd = force === undefined ? !this.values.has(value) : force;
        if (shouldAdd) this.values.add(value);
        else this.values.delete(value);
      }
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    querySelectorAll() {
      return [];
    },
    getBoundingClientRect() {
      return { left: 0, top: 0 };
    },
    focus() {},
    cloneNode() {
      return createElement(id);
    },
    replaceWith() {},
    addEventListener() {}
  };
}

function createContext() {
  const store = {};
  const elements = {};
  const context = {
    console,
    SAMPLE_DATA: [],
    Date,
    Math,
    Number,
    parseInt,
    setTimeout(fn) {
      if (typeof fn === 'function') fn();
      return 1;
    },
    clearTimeout() {},
    setInterval() { return 1; },
    clearInterval() {},
    requestAnimationFrame() {},
    cancelAnimationFrame() {},
    window: {
      innerWidth: 800,
      innerHeight: 600,
      addEventListener() {}
    },
    localStorage: {
      getItem(key) {
        return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
      },
      setItem(key, value) {
        store[key] = String(value);
      },
      removeItem(key) {
        delete store[key];
      }
    },
    document: {
      addEventListener() {},
      createElement(tag) {
        return createElement(tag);
      },
      getElementById(id) {
        if (!elements[id]) elements[id] = createElement(id);
        return elements[id];
      },
      querySelectorAll() {
        return [];
      },
      querySelector() {
        return null;
      },
      body: createElement('body')
    },
    loadFirebaseConfig() { return null; },
    initializeFirebase() {},
    showFirebaseSetsButton() {},
    renderSettingsScreen() {},
    refreshQuestionSetUI() {},
    refreshDataPreview() {},
    renderStatsScreen() {},
    startListen() {},
    startFlash() {},
    startTyping() {},
    startMatch() {},
    startWrite() {},
    speakJapanese() {},
    showToast() {},
    showComboPopup() {},
    maybeApplyFastCorrectCooldown() { return false; },
    updateQuestionStats() {},
    saveQuestionStats() {},
    saveDailyStreak() {},
    loadDailyStreak() {},
    loadSessionHistory() {},
    recordPlayTime() {},
    computeTotalStats() { return { totalCorrect: 0, totalWrong: 0, gameTypeStats: {} }; }
  };

  context.window.document = context.document;
  vm.createContext(context);
  vm.runInContext(
    `${mainSource}
${gameUtilsSource}
${storageSource}
${quizSource}
this.saveQuizResumeState = saveQuizResumeState;
this.loadQuizResumeState = loadQuizResumeState;
this.clearQuizResumeState = clearQuizResumeState;
this.resumeQuizFromState = resumeQuizFromState;
this.nextQuiz = nextQuiz;
this.recordAbandonedSession = recordAbandonedSession;
this.startGame = startGame;
this.openGameResumeModal = openGameResumeModal;
this.startFreshGame = startFreshGame;
this.getSessionHistory = () => sessionHistory;
this.getQuestions = () => questions;
this.quizState = () => ({ quizDeck, quizIdx, quizHP, quizScore, quizCombo, quizCorrect, quizWrong });
this.setQuizState = (state) => {
  quizDeck = state.deck || quizDeck;
  quizIdx = state.idx ?? quizIdx;
  quizHP = state.hp ?? quizHP;
  quizScore = state.score ?? quizScore;
  quizCombo = state.combo ?? quizCombo;
  quizCorrect = state.correct ?? quizCorrect;
  quizWrong = state.wrong ?? quizWrong;
};
this.setAppState = (state) => {
  activeSetId = state.activeSetId ?? activeSetId;
  questions = state.questions ?? questions;
  settings = { ...settings, ...(state.settings || {}) };
};`,
    context
  );
  context.store = store;
  context.elements = elements;
  return context;
}

function seedQuizInProgress(context) {
  const deck = [
    { word: '学生', q: 'Reading?', a: ['がくせい', 'がくぜい'], c: 0, questionId: 'q-1' },
    { word: '先生', q: 'Reading?', a: ['せんせい', 'せんぜい'], c: 0, questionId: 'q-2' }
  ];
  context.setAppState({ activeSetId: 'set-a', settings: { quizTimeLimit: 20 } });
  context.setQuizState({
    deck,
    idx: 1,
    hp: 80,
    score: 15,
    combo: 2,
    correct: 1,
    wrong: 1
  });
  return deck;
}

function testSavesAndLoadsQuizResumeSnapshot() {
  const context = createContext();
  seedQuizInProgress(context);

  const saved = context.saveQuizResumeState();
  const loaded = context.loadQuizResumeState();

  assert.strictEqual(saved.type, 'quiz');
  assert.strictEqual(loaded.type, 'quiz');
  assert.strictEqual(loaded.activeSetId, 'set-a');
  assert.strictEqual(loaded.idx, 1);
  assert.strictEqual(loaded.hp, 80);
  assert.strictEqual(loaded.score, 15);
  assert.strictEqual(loaded.combo, 2);
  assert.strictEqual(loaded.correct, 1);
  assert.strictEqual(loaded.wrong, 1);
  assert.deepStrictEqual(Array.from(loaded.deck.map(q => q.questionId)), ['q-1', 'q-2']);
}

function testResumeRestoresQuizGlobalsAndClearsSavedState() {
  const context = createContext();
  seedQuizInProgress(context);
  context.saveQuizResumeState();

  context.setQuizState({
    deck: [],
    idx: 0,
    hp: 100,
    score: 0,
    combo: 0,
    correct: 0,
    wrong: 0
  });

  const resumed = context.resumeQuizFromState();
  const state = context.quizState();

  assert.strictEqual(resumed, true);
  assert.strictEqual(state.quizDeck.length, 2);
  assert.strictEqual(state.quizIdx, 1);
  assert.strictEqual(state.quizHP, 80);
  assert.strictEqual(state.quizScore, 15);
  assert.strictEqual(state.quizCombo, 2);
  assert.strictEqual(state.quizCorrect, 1);
  assert.strictEqual(state.quizWrong, 1);
  assert.strictEqual(context.localStorage.getItem('jq_resume_quiz'), null);
}

function testDoesNotSaveResumeWhenQuizIsComplete() {
  const context = createContext();
  const deck = seedQuizInProgress(context);
  context.setQuizState({ idx: deck.length });

  assert.strictEqual(context.saveQuizResumeState(), false);
  assert.strictEqual(context.localStorage.getItem('jq_resume_quiz'), null);
}

function testRecordAbandonedSessionAddsStatusWithoutDuplicates() {
  const context = createContext();

  context.recordAbandonedSession('quiz', 15, 1, 1, 'resume-1');
  context.recordAbandonedSession('quiz', 15, 1, 1, 'resume-1');

  assert.strictEqual(context.getSessionHistory().length, 1);
  assert.strictEqual(context.getSessionHistory()[0].status, 'abandoned');
  assert.strictEqual(context.getSessionHistory()[0].resumeId, 'resume-1');
  assert.strictEqual(JSON.parse(context.localStorage.getItem('jq_session_history')).length, 1);
}

function testStartGameShowsResumeModalWhenQuizResumeExists() {
  const context = createContext();
  context.setAppState({ questions: [{ word: '学生' }] });
  seedQuizInProgress(context);
  context.saveQuizResumeState();

  context.startGame('quiz');

  assert.strictEqual(context.elements['quiz-resume-modal'].classList.contains('hidden'), false);
}

async function testNextQuizUsesServerNextQuestionWhenSessionActive() {
  const context = createContext();
  let nextCalled = false;
  let startedQuiz = false;
  context.setQuizState({
    deck: [
      { id: 'q-1', questionId: 'q-1', word: 'one', q: 'One?', a: ['1'], c: 0 }
    ],
    idx: 0
  });
  context.isNAServerGameSessionActive = () => true;
  context.nextServerGameQuestion = async () => {
    nextCalled = true;
    return {
      state: {
        game_type: 'quiz',
        current_index: 1,
        total: 2,
        current_question: { id: 'q-2' }
      }
    };
  };
  context.startQuiz = () => {
    startedQuiz = true;
  };

  await context.nextQuiz();

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(startedQuiz, true);
}

async function testStartGameShowsServerResumeModalBeforeContinuing() {
  const context = createContext();
  let startedFresh = false;
  context.setAppState({ questions: [{ id: 'q-1', word: 'one', q: 'One?', a: ['1'], c: 0 }] });
  context.isNAServerBusy = () => false;
  context.isNAServerConfigured = () => true;
  context.setNAServerBusy = () => {};
  context.resumeServerGame = async () => ({
    session_id: 'session-server',
    game_type: 'quiz',
    questions: [{ id: 'q-1', word: 'one', q: 'One?', a: ['1'], c: 0 }],
    state: { game_type: 'quiz', current_index: 0, current_question: { id: 'q-1' } }
  });
  context.startServerGame = async () => {
    throw new Error('restart should not be called before user confirms');
  };
  context.startFreshGame = () => {
    startedFresh = true;
  };

  await context.startGame('quiz');

  assert.strictEqual(context.elements['quiz-resume-modal'].classList.contains('hidden'), false);
  assert.strictEqual(startedFresh, false);
}

async function testStartGameCreatesServerSessionWhenNoResumeExists() {
  const context = createContext();
  let startCalls = 0;
  let startedFresh = false;
  context.setAppState({ questions: [] });
  context.isNAServerBusy = () => false;
  context.isNAServerConfigured = () => true;
  context.setNAServerBusy = () => {};
  context.resumeServerGame = async () => {
    throw new Error('No active session');
  };
  context.startServerGame = async () => {
    startCalls++;
    context.setAppState({ questions: [{ id: 'q-new', word: 'new', q: 'New?', a: ['new'], c: 0 }] });
    return {
      session_id: 'session-new',
      game_type: 'quiz',
      state: { game_type: 'quiz', current_index: 0, current_question: { id: 'q-new' } }
    };
  };
  context.startFreshGame = () => {
    startedFresh = true;
  };

  await context.startGame('quiz');

  assert.strictEqual(startCalls, 1);
  assert.strictEqual(startedFresh, true);
  assert.strictEqual(context.document.getElementById('quiz-resume-modal').classList.contains('hidden'), true);
}

async function testStartGameDoesNotStartOverWhenResumeCheckFailsUnexpectedly() {
  const context = createContext();
  let startCalls = 0;
  let toastMessage = '';
  context.setAppState({ questions: [{ id: 'q-local', word: 'local', q: 'Local?', a: ['local'], c: 0 }] });
  context.isNAServerBusy = () => false;
  context.isNAServerConfigured = () => true;
  context.setNAServerBusy = () => {};
  context.showToast = (message) => {
    toastMessage = message;
  };
  context.resumeServerGame = async () => {
    throw new Error('Database unavailable');
  };
  context.startServerGame = async () => {
    startCalls++;
  };

  await context.startGame('quiz');

  assert.strictEqual(startCalls, 0);
  assert.strictEqual(toastMessage.includes('Database unavailable'), true);
}

async function testServerResumeContinueRefreshesSessionWhenClicked() {
  const context = createContext();
  let resumeCalls = 0;
  let startedFresh = false;
  context.setAppState({ questions: [{ id: 'q-old', word: 'old', q: 'Old?', a: ['old'], c: 0 }] });
  context.isNAServerBusy = () => false;
  context.isNAServerConfigured = () => true;
  context.setNAServerBusy = () => {};
  context.resumeServerGame = async () => {
    resumeCalls++;
    context.setAppState({
      questions: [{
        id: resumeCalls === 1 ? 'q-old' : 'q-new',
        word: resumeCalls === 1 ? 'old' : 'new',
        q: 'Question?',
        a: ['answer'],
        c: 0
      }]
    });
    return {
      session_id: resumeCalls === 1 ? 'session-old' : 'session-new',
      game_type: 'quiz',
      questions: context.getQuestions(),
      state: {
        game_type: 'quiz',
        current_index: 0,
        current_question: { id: resumeCalls === 1 ? 'q-old' : 'q-new' }
      }
    };
  };
  context.startFreshGame = () => {
    startedFresh = true;
  };

  await context.startGame('quiz');
  await context.elements['quiz-resume-continue'].onclick();

  assert.strictEqual(resumeCalls, 2);
  assert.strictEqual(context.getQuestions()[0].id, 'q-new');
  assert.strictEqual(startedFresh, true);
}

async function testServerResumeRestartClearsLocalResumeBeforeStartingNewSession() {
  const context = createContext();
  seedQuizInProgress(context);
  context.saveQuizResumeState();
  context.isNAServerBusy = () => false;
  context.isNAServerConfigured = () => true;
  context.setNAServerBusy = () => {};
  context.resumeServerGame = async () => {
    context.setAppState({ questions: [{ id: 'q-old', word: 'old', q: 'Old?', a: ['old'], c: 0 }] });
    return {
      session_id: 'session-old',
      game_type: 'quiz',
      questions: context.getQuestions(),
      state: { game_type: 'quiz', current_index: 0, current_question: { id: 'q-old' } }
    };
  };
  context.startServerGame = async () => {
    assert.strictEqual(context.localStorage.getItem('jq_resume_quiz'), null);
    context.setAppState({ questions: [{ id: 'q-new', word: 'new', q: 'New?', a: ['new'], c: 0 }] });
    return {
      session_id: 'session-new',
      game_type: 'quiz',
      questions: context.getQuestions(),
      state: { game_type: 'quiz', current_index: 0, current_question: { id: 'q-new' } }
    };
  };
  context.startFreshGame = () => {};

  await context.startGame('quiz');
  await context.elements['quiz-resume-restart'].onclick();
}

testSavesAndLoadsQuizResumeSnapshot();
testResumeRestoresQuizGlobalsAndClearsSavedState();
testDoesNotSaveResumeWhenQuizIsComplete();
testRecordAbandonedSessionAddsStatusWithoutDuplicates();
testStartGameShowsResumeModalWhenQuizResumeExists();
Promise.resolve()
  .then(testStartGameShowsServerResumeModalBeforeContinuing)
  .then(testStartGameCreatesServerSessionWhenNoResumeExists)
  .then(testStartGameDoesNotStartOverWhenResumeCheckFailsUnexpectedly)
  .then(testNextQuizUsesServerNextQuestionWhenSessionActive)
  .then(testServerResumeContinueRefreshesSessionWhenClicked)
  .then(testServerResumeRestartClearsLocalResumeBeforeStartingNewSession)
  .then(() => {
  console.log('quiz resume tests passed');
}).catch(error => {
  console.error(error);
  process.exit(1);
});
