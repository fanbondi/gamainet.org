const test = require('node:test');
const assert = require('node:assert/strict');

const {
  isSingleEmailAddress,
  createRateLimiter,
} = require('../src/utils/email-validation');

test('accepts a single valid email address', () => {
  assert.equal(isSingleEmailAddress('member@example.com'), true);
  assert.equal(isSingleEmailAddress('  member@example.com  '), true);
});

test('rejects multiple recipients or malformed addresses', () => {
  assert.equal(isSingleEmailAddress('member@example.com, other@example.com'), false);
  assert.equal(isSingleEmailAddress('member@example.com\nother@example.com'), false);
  assert.equal(isSingleEmailAddress('not-an-email'), false);
  assert.equal(isSingleEmailAddress('member@'), false);
});

test('rate limiter blocks requests once the quota is exceeded', () => {
  const limiter = createRateLimiter({ windowMs: 60000, max: 2 });

  assert.equal(limiter('127.0.0.1'), true);
  assert.equal(limiter('127.0.0.1'), true);
  assert.equal(limiter('127.0.0.1'), false);
  assert.equal(limiter('127.0.0.2'), true);
});
