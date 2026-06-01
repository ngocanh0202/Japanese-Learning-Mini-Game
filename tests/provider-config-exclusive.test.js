const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'data-manager.js'), 'utf8');

const storage = new Map([
  ['jq_naserver_config', JSON.stringify({ baseUrl: 'http://api.test', token: 'abc' })]
]);

const fields = {
  'firebase-project-id': { value: 'firebase-project' },
  'firebase-api-key': { value: 'api-key' },
  'firebase-auth-domain': { value: 'firebase.test' },
  'firebase-bucket': { value: 'bucket' },
  'firebase-messaging-sender-id': { value: 'sender' },
  'firebase-app-id': { value: 'app' },
  'firebase-measurement-id': { value: 'measure' },
  'firebase-config-panel': { classList: { add() {} } }
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
    createElement() {
      return { click() {}, remove() {} };
    },
    body: { appendChild() {} }
  },
  Blob: function Blob() {},
  URL: { createObjectURL: () => '', revokeObjectURL() {} },
  ensureFirebaseSdkLoaded: async () => true,
  initializeFirebase: () => true,
  showToast() {},
  showFirebaseSetsButton() {},
  SAMPLE_DATA: [],
  questions: [],
  questionSets: [],
  dataPage: 1,
  importEditIndex: null,
  activeSetId: null,
  firebase: { firestore: { FieldValue: { serverTimestamp: () => null } } }
};

vm.createContext(context);
vm.runInContext(source, context);

(async () => {
  await vm.runInContext('saveFirebaseConfig()', context);

  assert.strictEqual(storage.has('jq_naserver_config'), false);
  assert.strictEqual(JSON.parse(storage.get('jq_firebase_config')).projectId, 'firebase-project');

  console.log('provider config exclusivity tests passed');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
