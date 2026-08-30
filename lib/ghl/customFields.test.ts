import test from 'node:test';
import assert from 'node:assert/strict';
import { readGhlCustomValue } from './customFields.ts';

test('reads current HighLevel v3 fieldValue values', () => {
  const fields = [
    { id: 'job-address', fieldValue: '9862 Lake Dr, Weeki Wachee, FL 34613' },
    { id: 'deposit', fieldValue: 2500 },
  ];

  assert.equal(
    readGhlCustomValue(fields, 'job-address'),
    '9862 Lake Dr, Weeki Wachee, FL 34613',
  );
  assert.equal(readGhlCustomValue(fields, 'deposit'), 2500);
});

test('retains legacy HighLevel custom-field compatibility', () => {
  assert.equal(
    readGhlCustomValue([{ id: 'legacy-text', fieldValueString: 'Legacy value' }], 'legacy-text'),
    'Legacy value',
  );
  assert.equal(
    readGhlCustomValue([{ id: 'legacy-number', fieldValueNumber: 42 }], 'legacy-number'),
    42,
  );
  assert.equal(
    readGhlCustomValue([{ id: 'legacy-snake', field_value: 'snake' }], 'legacy-snake'),
    'snake',
  );
});

test('prefers current fieldValue when both current and legacy shapes exist', () => {
  assert.equal(
    readGhlCustomValue([
      { id: 'mixed', fieldValue: 'current', fieldValueString: 'legacy' },
    ], 'mixed'),
    'current',
  );
});
