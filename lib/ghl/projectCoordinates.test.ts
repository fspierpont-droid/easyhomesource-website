import assert from 'node:assert/strict';
import test from 'node:test';
import { hasValidCoordinates } from './projectCoordinates.ts';

test('accepts finite in-range coordinates, including real Florida coordinates', () => {
  assert.equal(hasValidCoordinates({ latitude: 28.5553, longitude: -82.3879 }), true);
  assert.equal(hasValidCoordinates({ latitude: 0, longitude: 0 }), true);
  assert.equal(hasValidCoordinates({ latitude: -90, longitude: 180 }), true);
});

test('rejects missing or null coordinates', () => {
  assert.equal(hasValidCoordinates({ latitude: null, longitude: null }), false);
  assert.equal(hasValidCoordinates({ longitude: -82.3879 }), false);
  assert.equal(hasValidCoordinates({ latitude: 28.5553 }), false);
});

test('rejects NaN, infinities, empty strings, and numeric strings', () => {
  assert.equal(hasValidCoordinates({ latitude: Number.NaN, longitude: -82.3879 }), false);
  assert.equal(hasValidCoordinates({ latitude: 28.5553, longitude: Number.POSITIVE_INFINITY }), false);
  assert.equal(hasValidCoordinates({ latitude: '', longitude: -82.3879 }), false);
  assert.equal(hasValidCoordinates({ latitude: '28.5553', longitude: '-82.3879' }), false);
});

test('rejects out-of-range coordinates', () => {
  assert.equal(hasValidCoordinates({ latitude: 90.0001, longitude: -82.3879 }), false);
  assert.equal(hasValidCoordinates({ latitude: 28.5553, longitude: -180.0001 }), false);
});

test('filtering retains only mappable projects without changing the source list', () => {
  const projects = [
    { id: 'mapped', latitude: 28.5553, longitude: -82.3879 },
    { id: 'unmapped', latitude: null, longitude: null }
  ];
  const mappedProjects = projects.filter(hasValidCoordinates);

  assert.deepEqual(mappedProjects.map(({ id }) => id), ['mapped']);
  assert.equal(projects.length, 2);
});

test('GHL null values cannot be coerced into a valid Null Island coordinate', () => {
  const rawContact = { latitude: null, longitude: null };
  const coordinates = { latitude: rawContact.latitude, longitude: rawContact.longitude };

  assert.equal(hasValidCoordinates(coordinates), false);
  assert.notDeepEqual(coordinates, { latitude: 0, longitude: 0 });
});
