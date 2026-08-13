import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveSelectedProject } from './projectSelection.ts';

const oldProject = { ghlOpportunityId: 'opp-1', stage: 'PERMITTING' } as never;
const reconciledProject = { ghlOpportunityId: 'opp-1', stage: 'COMPLETED' } as never;

test('selected inspector resolves the new canonical object after reconciliation', () => {
  assert.equal(resolveSelectedProject([oldProject], 'opp-1'), oldProject);
  assert.equal(resolveSelectedProject([reconciledProject], 'opp-1'), reconciledProject);
  assert.equal(resolveSelectedProject([reconciledProject], 'missing'), null);
});
