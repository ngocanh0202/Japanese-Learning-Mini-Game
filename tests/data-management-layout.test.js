const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const match = html.match(/<section class="dashboard-card" id="import-export-card">[\s\S]*?<\/section>/);

assert.ok(match, 'Import/export section should have id="import-export-card"');
assert.ok(match[0].includes('<h3>Import / Export</h3>'), 'import-export-card should be attached to the Import / Export section');
assert.strictEqual(match[0].includes('<h3>Question Set</h3>'), false, 'import-export-card must not be attached to the Question Set section');

console.log('data management layout tests passed');
