const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'naserver-api.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const storage = new Map();
const fields = {
  'storage-provider-mode': { value: 'naserver' },
  'naserver-email': { value: '', textContent: '', classList: { add() {}, remove() {}, toggle() {} } },
  'naserver-password': { value: '', textContent: '', classList: { add() {}, remove() {}, toggle() {} } },
  'naserver-password-confirm': { value: '', textContent: '', classList: { add() {}, remove() {}, toggle() {} } },
  'naserver-account-status': { textContent: '', classList: { add() {}, remove() {}, toggle() {} } },
  'naserver-auth-panel': { classList: { add() {}, remove() {}, toggle() {} } },
  'btn-naserver-login-open': { classList: { add() {}, remove() {}, toggle() {} } },
  'btn-naserver-register-open': { classList: { add() {}, remove() {}, toggle() {} } },
  'btn-naserver-logout': { classList: { add() {}, remove() {}, toggle() {} } },
  'naserver-sync-actions': { classList: { add() {}, remove() {}, toggle() {} } }
};

const context = {
  console,
  localStorage: {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, value);
    },
    removeItem(key) {
      storage.delete(key);
    }
  },
  document: {
    getElementById(id) {
      return fields[id] || { value: '', classList: { add() {}, remove() {}, toggle() {} } };
    },
    querySelectorAll() {
      return [];
    },
    querySelector() {
      return null;
    },
  },
  showToast() {},
  setTimeout() {},
};

vm.createContext(context);
vm.runInContext(source, context);

(async () => {
  const firebaseConfig = vm.runInContext("normalizeNAServerConfig({ provider: 'firebase', baseUrl: 'http://api.test', token: 'abc' })", context);
  assert.strictEqual(firebaseConfig.provider, 'naserver');

  vm.runInContext("setProviderMode('firebase')", context);
  assert.strictEqual(JSON.parse(storage.get('jq_naserver_config')).provider, 'naserver');

  assert.strictEqual(html.includes('firebase-config-panel'), false);
  assert.strictEqual(html.includes('btn-firebase-sets'), false);
  assert.strictEqual(html.includes('js/firebase-config.js'), false);
  assert.strictEqual(html.includes('btn-backup'), false);
  assert.strictEqual(html.includes('backupQuestionSet()'), false);
  assert.strictEqual(html.includes('Custom Firebase'), false);

  console.log('provider config exclusivity tests passed');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
