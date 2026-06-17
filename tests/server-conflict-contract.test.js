const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..', '..');
const router = fs.readFileSync(
  path.join(repoRoot, 'NAServer', 'backend', 'apps', 'japanese_learning_game', 'routers', 'questions.py'),
  'utf8'
);
const models = fs.readFileSync(
  path.join(repoRoot, 'NAServer', 'backend', 'apps', 'japanese_learning_game', 'models.py'),
  'utf8'
);

assert.ok(models.includes('expected_updated_at'), 'question-set and question mutation models should accept expected_updated_at');
assert.ok(router.includes('CONFLICT_DETAIL = "Data on server has changed. Please pull latest before editing/deleting."'));
assert.ok(router.includes('status_code=409'), 'backend should return HTTP 409 for stale updates');
assert.ok(router.includes('assert_not_stale(doc, req.expected_updated_at)'), 'update routes should check expected_updated_at');
assert.ok(router.includes('expected_updated_at: Optional[str] = Query(default=None)'), 'delete routes should receive expected_updated_at from query');

console.log('server conflict contract tests passed');
