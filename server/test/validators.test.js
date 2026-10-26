import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSeats, validateRegistration, generateBookingRef, normalizeEmail } from '../src/utils/validators.js';

test('parseSeats accepts, sorts and normalizes', () => {
  assert.deepEqual(parseSeats(['b2', 'A10', 'A1']), ['A1', 'A10', 'B2']);
});
test('parseSeats rejects bad input', () => {
  assert.throws(() => parseSeats([]));
  assert.throws(() => parseSeats(['Z1']));
  assert.throws(() => parseSeats(['A11']));
  assert.throws(() => parseSeats(['A1', 'A1']));
  assert.throws(() => parseSeats(['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']));
  assert.throws(() => parseSeats('A1'));
});
test('validateRegistration', () => {
  assert.deepEqual(validateRegistration({ name: 'Stuti', email: 'S@X.com', password: 'abcd1234' }), {});
  const e = validateRegistration({ name: '', email: 'nope', password: 'short' });
  assert.ok(e.name && e.email && e.password);
});
test('booking ref format', () => {
  assert.match(generateBookingRef(), /^IMV-[A-HJ-NP-Z2-9]{8}$/);
});
test('normalizeEmail', () => assert.equal(normalizeEmail('  A@B.COM '), 'a@b.com'));
