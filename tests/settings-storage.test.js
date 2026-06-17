const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const mainSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');
const storageSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'storage.js'), 'utf8');

const storedSettings = {
  priority: {
    enabled: true,
    global: { incorrect: 4, timeSinceSeen: 1, learning: 1, slowResponse: 0 }
  }
};

const context = {
  console,
  document: {
    addEventListener() {}
  },
  localStorage: {
    getItem(key) {
      if (key === 'jq_settings') return JSON.stringify(storedSettings);
      return null;
    },
    setItem() {}
  },
  SAMPLE_DATA: []
};
context.generateQuestionId = q => q.id || q.word || 'q';
context.getScopedQuestionId = q => q.id || q.word || 'q';
context.questionStats = {};
context.getDefaultQuestionTypeStats = () => ({});

vm.createContext(context);
vm.runInContext(
  `${mainSource}
${storageSource}
loadSettingsFromStorage();
this.loadedSettings = settings;`,
  context
);

assert.strictEqual(context.loadedSettings.priority.global.incorrect, 4);
assert.ok(context.loadedSettings.priority.perGame.quiz);
assert.ok(context.loadedSettings.priority.perGame.listen);
assert.strictEqual(context.loadedSettings.fastCorrectCooldownDays, 3);

let savedSets = null;
let savedActiveSet = null;
const offlineContext = {
  console,
  document: {
    getElementById() {
      return null;
    }
  },
  localStorage: {
    getItem(key) {
      if (key === 'jq_question_sets') {
        return JSON.stringify([
          { id: 'server-old', serverId: 's-1', serverOnly: true, name: 'Server Old', questions: [{ word: 'server' }] }
        ]);
      }
      if (key === 'jq_active_set') return 'server-old';
      return null;
    },
    setItem(key, value) {
      if (key === 'jq_question_sets') savedSets = value;
      if (key === 'jq_active_set') savedActiveSet = value;
    }
  },
  SAMPLE_DATA: [{ word: 'local-default' }],
  questionSets: [],
  activeSetId: null,
  questions: [],
  playerHP: 100,
  playerEXP: 0,
  playerLevel: 1,
  playerCombo: 0,
  initQuestionStats() {},
  normalizePlayerProgress() {},
  generateQuestionId(q) {
    return q.id || q.word || 'q';
  },
  getScopedQuestionId(q) {
    return q.id || q.word || 'q';
  },
  questionStats: {},
  getDefaultQuestionTypeStats() {
    return {};
  },
  isNAServerConfigured() {
    return false;
  }
};

vm.createContext(offlineContext);
vm.runInContext(`${storageSource}
loadFromStorage();`, offlineContext);

assert.strictEqual(JSON.stringify(offlineContext.questionSets.map(set => set.id)), JSON.stringify(['set-default']));
assert.strictEqual(offlineContext.activeSetId, 'set-default');
assert.strictEqual(JSON.stringify(offlineContext.questions), JSON.stringify([{ word: 'local-default' }]));
assert.strictEqual(JSON.parse(savedSets)[0].id, 'set-default');
assert.strictEqual(savedActiveSet, 'set-default');

console.log('settings storage tests passed');
