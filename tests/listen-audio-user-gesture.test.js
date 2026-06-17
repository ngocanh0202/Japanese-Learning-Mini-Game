const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'games', 'game-listen.js'), 'utf8');

function createElement(id) {
  return {
    id,
    textContent: '',
    innerHTML: '',
    style: {},
    dataset: {},
    children: [],
    disabled: false,
    className: '',
    classList: {
      values: new Set(),
      add(...names) {
        names.forEach(name => this.values.add(name));
      },
      remove(...names) {
        names.forEach(name => this.values.delete(name));
      },
      toggle(name, force) {
        if (force === false) this.values.delete(name);
        else this.values.add(name);
      },
      contains(name) {
        return this.values.has(name);
      }
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    }
  };
}

let speakCalls = 0;
const elements = new Map();
[
  'screen-listen',
  'listen-progress',
  'listen-audio-status',
  'listen-explanation',
  'listen-next',
  'listen-practice-writing',
  'listen-choices',
  'listen-score',
  'listen-combo',
  'listen-timer',
  'listen-hpbar'
].forEach(id => elements.set(id, createElement(id)));

const context = {
  console,
  Date,
  setInterval() {
    return 1;
  },
  clearInterval() {},
  setTimeout(fn) {
    fn();
    return 1;
  },
  clearTimeout() {},
  localStorage: {
    getItem() {
      return null;
    },
    setItem() {},
    removeItem() {}
  },
  document: {
    getElementById(id) {
      return elements.get(id) || null;
    },
    createElement(tag) {
      return createElement(tag);
    },
    querySelectorAll() {
      return [];
    }
  },
  window: {
    speechSynthesis: {
      cancel() {},
      speak() {
        speakCalls++;
      },
      getVoices() {
        return [{ lang: 'ja-JP', name: 'Japanese' }];
      }
    }
  },
  SpeechSynthesisUtterance: function SpeechSynthesisUtterance(text) {
    this.text = text;
  },
  settings: { quizTimerEnabled: false, quizTimeLimit: 20, shuffleAnswers: false, disableGameOver: true },
  shuffleAnswerOptions(q) {
    return { options: q.a, correctIndex: q.c };
  },
  showScreen() {},
  getPrioritizedDeck() {
    return [];
  },
  generateQuestionId(q) {
    return q.word;
  },
  handleEmptyGameDeck() {},
  gameOver() {},
  showToast() {},
  updateQuestionStats() {},
  maybeApplyFastCorrectCooldown() {
    return false;
  },
  BASE_XP_REWARD: 10,
  playerCombo: 0
};

vm.createContext(context);
vm.runInContext(source, context);
vm.runInContext(`
  listenDeck = [{
    word: '学生',
    romaji: 'gakusei',
    translation: 'student',
    a: ['gakusei', 'sensei'],
    c: 0,
    questionId: 'q1'
  }];
  listenIdx = 0;
  listenHP = 100;
  renderListen();
`, context);

assert.strictEqual(speakCalls, 0);
assert.strictEqual(elements.get('listen-audio-status').textContent, 'Click Play to hear the Japanese word.');

vm.runInContext('replayListenAudio()', context);
assert.strictEqual(speakCalls, 1);

console.log('listen audio user gesture tests passed');
