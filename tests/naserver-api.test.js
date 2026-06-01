const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'naserver-api.js'), 'utf8');

let storedConfig = JSON.stringify({
  baseUrl: 'http://api.test/',
  token: 'abc'
});
const calls = [];

const context = {
  console,
  localStorage: {
    getItem(key) {
      return key === 'jq_naserver_config' ? storedConfig : null;
    },
    setItem(key, value) {
      if (key === 'jq_naserver_config') storedConfig = value;
    }
  },
  document: {
    getElementById() {
      return null;
    }
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

  console.log('naserver api tests passed');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
