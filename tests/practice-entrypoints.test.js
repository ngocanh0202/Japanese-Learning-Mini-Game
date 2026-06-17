const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

assert.strictEqual(html.includes('id="quiz-practice-writing"'), false);
assert.strictEqual(html.includes('id="listen-practice-writing"'), false);
assert.strictEqual(html.includes('id="practice-candidates"'), true);
assert.strictEqual(html.includes('data-candidate-list="practice-candidates"'), true);

console.log('practice entrypoint tests passed');
