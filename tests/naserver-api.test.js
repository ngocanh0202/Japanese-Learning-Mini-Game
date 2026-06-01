const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'naserver-api.js'), 'utf8');

let storedConfig = JSON.stringify({
  baseUrl: 'http://api.test/',
  token: 'abc'
});
let storedFirebaseConfig = JSON.stringify({ projectId: 'firebase-project' });
const calls = [];

const context = {
  console,
  localStorage: {
    getItem(key) {
      if (key === 'jq_naserver_config') return storedConfig;
      if (key === 'jq_firebase_config') return storedFirebaseConfig;
      return null;
    },
    setItem(key, value) {
      if (key === 'jq_naserver_config') storedConfig = value;
      if (key === 'jq_firebase_config') storedFirebaseConfig = value;
    },
    removeItem(key) {
      if (key === 'jq_naserver_config') storedConfig = null;
      if (key === 'jq_firebase_config') storedFirebaseConfig = null;
    }
  },
  document: {
    getElementById(id) {
      if (id === 'naserver-base-url') return { value: 'http://api.saved/' };
      if (id === 'naserver-token') return { value: 'saved-token' };
      return null;
    }
  },
  showFirebaseSetsButton(show) {
    calls.push({ type: 'firebaseButton', show });
  },
  showToast(message, type) {
    calls.push({ type: 'toast', message, toastType: type });
  },
  fetch: async (url, options) => {
    calls.push({ url, options });
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
  assert.strictEqual(config.baseUrl, 'http://api.test/');
  assert.strictEqual(vm.runInContext('getNAServerBaseUrl()', context), 'http://api.test');

  await vm.runInContext("requestNAServer('/api/japanese-learning-game/active-set')", context);
  assert.strictEqual(calls[0].url, 'http://api.test/api/japanese-learning-game/active-set');
  assert.strictEqual(calls[0].options.headers.Authorization, 'Bearer abc');

  vm.runInContext('saveNAServerConfigFromUI()', context);
  assert.strictEqual(storedFirebaseConfig, null);
  assert.strictEqual(JSON.parse(storedConfig).baseUrl, 'http://api.saved/');
  assert.strictEqual(JSON.parse(storedConfig).token, 'saved-token');
  assert.deepStrictEqual(calls.find(call => call.type === 'firebaseButton'), {
    type: 'firebaseButton',
    show: false
  });

  console.log('naserver api tests passed');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
