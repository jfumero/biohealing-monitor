import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_SESSION, SESSION_SECONDS, sessionReducer, progress } from '../src/session.js';

test('a session pauses, resumes, finishes exactly at 100%, and can restart', () => {
  let state = sessionReducer(INITIAL_SESSION, {type:'start'});
  state = sessionReducer(state,{type:'tick',seconds:12});
  state = sessionReducer(state,{type:'pause'});
  assert.equal(sessionReducer(state,{type:'tick',seconds:20}).elapsed,12);
  state = sessionReducer(state,{type:'resume'});
  state = sessionReducer(state,{type:'tick',seconds:200});
  assert.equal(state.status,'complete');
  assert.equal(state.elapsed,SESSION_SECONDS);
  assert.equal(progress(state.elapsed),100);
  assert.deepEqual(sessionReducer(state,{type:'start'}),{status:'running',elapsed:0});
});
test('cancelling stops future ticks and keeps the final progress', () => {
  let state = sessionReducer(INITIAL_SESSION,{type:'start'});
  state = sessionReducer(state,{type:'tick',seconds:15});
  state = sessionReducer(state,{type:'cancel'});
  assert.deepEqual(sessionReducer(state,{type:'tick',seconds:10}),{status:'cancelled',elapsed:15});
});
