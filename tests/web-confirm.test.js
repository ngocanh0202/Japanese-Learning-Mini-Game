const assert = require('assert');
const fs = require('fs');
const path = require('path');

const files = [
  'js/data-manager.js',
  'js/storage.js',
  'js/settings.js'
];

files.forEach(file => {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  assert.strictEqual(
    /\bconfirm\s*\(/.test(source),
    false,
    `${file} should use the web confirm modal instead of browser confirm()`
  );
});

console.log('web confirm tests passed');
