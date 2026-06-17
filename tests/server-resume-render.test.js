const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sources = [
  ['js', 'main.js'],
  ['js', 'game-utils.js'],
  ['js', 'storage.js'],
  ['js', 'games', 'game-quiz.js'],
  ['js', 'games', 'game-listen.js']
].map(parts => fs.readFileSync(path.join(__dirname, '..', ...parts), 'utf8'));

function createClassList(initial = []) {
  return {
    values: new Set(initial),
    add(value) { this.values.add(value); },
    remove(value) { this.values.delete(value); },
    contains(value) { return this.values.has(value); },
    toggle(value, force) {
      const shouldAdd = force === undefined ? !this.values.has(value) : force;
      if (shouldAdd) this.values.add(value);
      else this.values.delete(value);
    }
  };
}

function createElement(id) {
  let html = '';
  let classNameValue = '';
  const element = {
    id,
    tagName: id,
    textContent: '',
    value: '',
    style: {},
    children: [],
    dataset: {},
    disabled: false,
    type: '',
    classList: createClassList(['hidden']),
    get className() {
      return classNameValue;
    },
    set className(value) {
      classNameValue = String(value || '');
      this.classList = createClassList(classNameValue.split(/\s+/).filter(Boolean));
    },
    get innerHTML() {
      return html;
    },
    set innerHTML(value) {
      html = String(value || '');
      this.children = [];
    },
    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    },
    querySelectorAll(selector) {
      const className = selector.startsWith('.') ? selector.slice(1) : selector;
      const results = [];
      const visit = node => {
        if (node.classList?.contains(className)) results.push(node);
        (node.children || []).forEach(visit);
      };
      this.children.forEach(visit);
      return results;
    },
    querySelector(selector) {
      return this.querySelectorAll(selector)[0] || null;
    },
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 300, height: 150 };
    },
    focus() {},
    cloneNode() {
      return createElement(id);
    },
    replaceWith() {},
    addEventListener() {},
    removeEventListener() {},
    setAttribute(name, value) {
      this[name] = String(value);
    },
    removeAttribute(name) {
      delete this[name];
    },
    remove() {
      if (!this.parentNode) return;
      this.parentNode.children = this.parentNode.children.filter(child => child !== this);
    }
  };
  return element;
}

function createContext() {
  const elements = {};
  const store = {};
  const context = {
    console,
    Date,
    Math,
    Number,
    parseInt,
    JSON,
    Array,
    Object,
    String,
    setTimeout() { return 1; },
    clearTimeout() {},
    setInterval() { return 1; },
    clearInterval() {},
    requestAnimationFrame() { return 1; },
    cancelAnimationFrame() {},
    window: {
      innerWidth: 800,
      innerHeight: 600,
      addEventListener() {},
      removeEventListener() {}
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
      removeEventListener() {},
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
    SAMPLE_DATA: [],
    loadFirebaseConfig() { return null; },
    initializeFirebase() {},
    showFirebaseSetsButton() {},
    renderSettingsScreen() {},
    refreshQuestionSetUI() {},
    refreshDataPreview() {},
    renderStatsScreen() {},
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
    `${sources.join('\n')}
this.renderQuiz = renderQuiz;
this.renderListen = renderListen;
this.setServerState = state => { this.serverState = state; };
this.isNAServerGameSessionActive = () => !!this.serverState;
this.getNAServerGameState = () => this.serverState;
this.setQuizState = state => {
  quizDeck = state.deck;
  quizIdx = state.idx || 0;
  quizHP = state.hp ?? 100;
  quizScore = state.score ?? 0;
  quizCombo = state.combo ?? 0;
};
this.setListenState = state => {
  listenDeck = state.deck;
  listenIdx = state.idx || 0;
  listenHP = state.hp ?? 100;
  listenScore = state.score ?? 0;
  listenCombo = state.combo ?? 0;
};
this.setAppSettings = next => { settings = { ...settings, ...next }; };`,
    context
  );
  context.elements = elements;
  return context;
}

function seedQuiz(context, serverState) {
  context.setAppSettings({ shuffleAnswers: false, quizTimerEnabled: false });
  context.setServerState(serverState);
  context.setQuizState({
    deck: [{
      id: 'q-2',
      questionId: 'q-2',
      word: 'three',
      q: 'Three?',
      a: ['correct', 'wrong'],
      ex: 'Explanation'
    }]
  });
}

function seedListen(context, serverState) {
  context.setAppSettings({ shuffleAnswers: false, quizTimerEnabled: false });
  context.setServerState(serverState);
  context.setListenState({
    deck: [{
      id: 'q-2',
      questionId: 'q-2',
      word: 'three',
      q: 'Three?',
      a: ['correct', 'wrong'],
      translation: 'three translation',
      ex: 'Listen explanation'
    }]
  });
}

function testQuizAnsweredResumeRendersLockedAnswer() {
  const context = createContext();
  seedQuiz(context, {
    game_type: 'quiz',
    current_index: 2,
    total: 5,
    current_answered: true,
    current_answer: { question_id: 'q-2', question_index: 2, answer_index: 1, correct: false, correct_index: 0 }
  });

  context.renderQuiz();

  const choices = context.elements['quiz-choices'].children;
  assert.strictEqual(context.elements['quiz-progress'].textContent, '3 / 5');
  assert.strictEqual(choices.length, 2);
  assert.strictEqual(choices.every(btn => btn.disabled), true);
  assert.strictEqual(choices[0].classList.contains('correct'), true);
  assert.strictEqual(choices[1].classList.contains('wrong'), true);
  assert.strictEqual(context.elements['quiz-next'].classList.contains('hidden'), false);
  assert.strictEqual(context.elements['quiz-explanation'].classList.contains('hidden'), false);
}

function testQuizUnansweredResumeAllowsAnswering() {
  const context = createContext();
  seedQuiz(context, {
    game_type: 'quiz',
    current_index: 2,
    total: 5,
    current_answered: false,
    current_answer: null
  });

  context.renderQuiz();

  const choices = context.elements['quiz-choices'].children;
  assert.strictEqual(context.elements['quiz-progress'].textContent, '3 / 5');
  assert.strictEqual(choices.length, 2);
  assert.strictEqual(choices.every(btn => btn.disabled), false);
  assert.strictEqual(choices.some(btn => btn.classList.contains('correct') || btn.classList.contains('wrong')), false);
  assert.strictEqual(context.elements['quiz-next'].classList.contains('hidden'), true);
}

function testListenAnsweredResumeRendersLockedAnswer() {
  const context = createContext();
  seedListen(context, {
    game_type: 'listen',
    current_index: 2,
    total: 5,
    current_answered: true,
    current_answer: { question_id: 'q-2', question_index: 2, answer_index: 1, correct: false, correct_index: 0 }
  });

  context.renderListen();

  const choices = context.elements['listen-choices'].children;
  assert.strictEqual(context.elements['listen-progress'].textContent, '3 / 5');
  assert.strictEqual(choices.length, 2);
  assert.strictEqual(choices.every(btn => btn.disabled), true);
  assert.strictEqual(choices[0].classList.contains('correct'), true);
  assert.strictEqual(choices[1].classList.contains('wrong'), true);
  assert.strictEqual(context.elements['listen-next'].classList.contains('hidden'), false);
  assert.strictEqual(context.elements['listen-explanation'].classList.contains('hidden'), false);
}

function testListenUnansweredResumeAllowsAnswering() {
  const context = createContext();
  seedListen(context, {
    game_type: 'listen',
    current_index: 2,
    total: 5,
    current_answered: false,
    current_answer: null
  });

  context.renderListen();

  const choices = context.elements['listen-choices'].children;
  assert.strictEqual(context.elements['listen-progress'].textContent, '3 / 5');
  assert.strictEqual(choices.length, 2);
  assert.strictEqual(choices.every(btn => btn.disabled), false);
  assert.strictEqual(choices.some(btn => btn.classList.contains('correct') || btn.classList.contains('wrong')), false);
  assert.strictEqual(context.elements['listen-next'].classList.contains('hidden'), true);
}

testQuizAnsweredResumeRendersLockedAnswer();
testQuizUnansweredResumeAllowsAnswering();
testListenAnsweredResumeRendersLockedAnswer();
testListenUnansweredResumeAllowsAnswering();

console.log('server resume render tests passed');
