const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'naserver-api.js'), 'utf8');

let storedConfig = null;
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
      if (id === 'storage-provider-mode') return { value: 'naserver' };
      if (id === 'naserver-email') return { value: 'saved@example.com', textContent: '', classList: { add() {}, remove() {} } };
      if (id === 'naserver-password') return { value: 'saved-password', textContent: '', classList: { add() {}, remove() {} } };
      if (id === 'naserver-account-status') return { textContent: '', classList: { add() {}, remove() {} } };
      if (id === 'naserver-auth-panel') return { classList: { add() {}, remove() {} } };
      if (id === 'firebase-config-panel') return { classList: { add() {}, remove() {} } };
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
  assert.strictEqual(storedFirebaseConfig, null);
  assert.strictEqual(vm.runInContext('isNAServerConfigured()', context), true);

  await vm.runInContext("requestNAServer('/api/japanese-learning-game/active-set')", context);
  const fetchCalls = calls.filter(call => call.url);
  assert.strictEqual(fetchCalls[1].url, 'http://127.0.0.1:8000/api/japanese-learning-game/active-set');
  assert.strictEqual(fetchCalls[1].options.headers.Authorization, 'Bearer token-123');

  await vm.runInContext("registerNAServerAccount('new@example.com', 'secret')", context);
  assert.strictEqual(fetchCalls.length, 2);
  assert.strictEqual(calls.filter(call => call.url)[2].url, 'http://127.0.0.1:8000/api/japanese-learning-game/auth/register');

  vm.runInContext("setProviderMode('firebase')", context);
  assert.strictEqual(vm.runInContext('isFirebaseProviderMode()', context), true);
  assert.strictEqual(vm.runInContext('isNAServerConfigured()', context), false);
  assert.deepStrictEqual(calls.find(call => call.type === 'firebaseButton'), {
    type: 'firebaseButton',
    show: false
  });

  console.log('naserver api tests passed');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
