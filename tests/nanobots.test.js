import test from 'node:test';
import assert from 'node:assert/strict';
import { TARGETS, SWARM_SIZE, ENTRY_PATH, missionState, botPosition, pointOnPath } from '../src/nanobots.js';
import { INITIAL_SESSION, sessionReducer } from '../src/session.js';

test('deployment, renewal and integration follow the same 60-second session',()=>{
  assert.equal(missionState(0,'idle').deployed,0);
  assert.equal(missionState(6,'running').deployed,SWARM_SIZE/2);
  assert.equal(missionState(12,'running').phase.id,'explore');
  assert.equal(missionState(24,'running').phase.id,'focus');
  assert.equal(missionState(37,'running').renewal,50);
  assert.equal(missionState(50,'running').phase.id,'return');
  assert.equal(missionState(60,'complete').renewal,100);
  assert.equal(missionState(60,'complete').moving,false);
});

test('pausing freezes swarm positions, and restart restores entry',()=>{
  let state=sessionReducer(INITIAL_SESSION,{type:'start'});
  state=sessionReducer(state,{type:'tick',seconds:32});
  const before=botPosition(12,state.elapsed,'chest');
  state=sessionReducer(state,{type:'pause'});
  state=sessionReducer(state,{type:'tick',seconds:5});
  assert.deepEqual(botPosition(12,state.elapsed,'chest'),before);
  assert.equal(missionState(state.elapsed,state.status).moving,false);
  state=sessionReducer(state,{type:'resume'});
  state=sessionReducer(state,{type:'tick',seconds:5});
  assert.notDeepEqual(botPosition(12,state.elapsed,'chest'),before);
  state=sessionReducer(state,{type:'start'});
  assert.deepEqual(botPosition(12,state.elapsed,'chest'),ENTRY_PATH[0]);
});

test('target selection directs the swarm near the selected region during focus',()=>{
  for(const target of TARGETS.filter(t=>t.id!=='whole')) {
    for(let i=0;i<56;i++) {
      const p=botPosition(i,35,target.id);
      assert.ok(Math.hypot(p[0]-target.point[0],p[1]-target.point[1])<=21);
    }
  }
});

test('all paths have finite points and stable final positions',()=>{
  assert.deepEqual(pointOnPath(ENTRY_PATH,0),ENTRY_PATH[0]);
  assert.deepEqual(pointOnPath(ENTRY_PATH,1),ENTRY_PATH.at(-1));
  for(const target of TARGETS) for(const elapsed of [0,6,12,24,26,49.9,50,60,100]) for(let i=0;i<56;i++) {
    const p=botPosition(i,elapsed,target.id);
    assert.ok(p.every(Number.isFinite));
    assert.ok(p[0]>=0&&p[0]<=480&&p[1]>=0&&p[1]<=500);
  }
  assert.deepEqual(botPosition(3,60,'head'),botPosition(3,100,'head'));
});
