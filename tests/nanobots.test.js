import test from 'node:test';
import assert from 'node:assert/strict';
import { TARGETS, SWARM_SIZE, ENTRY_PATH, BODY_PATHS, REGION_ROUTES, patrolPosition, missionState, botPosition, pointOnPath } from '../src/nanobots.js';
import { INITIAL_SESSION, sessionReducer } from '../src/session.js';

test('deployment, renewal and patrol follow the same 60-second session',()=>{
  assert.equal(missionState(0,'idle').deployed,0);
  assert.equal(missionState(6,'running').deployed,SWARM_SIZE/2);
  assert.equal(missionState(12,'running').phase.id,'explore');
  assert.equal(missionState(24,'running').phase.id,'focus');
  assert.equal(missionState(37,'running').renewal,50);
  assert.equal(missionState(50,'running').phase.id,'patrol');
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

function distanceToSegment(point,a,b) {
  const dx=b[0]-a[0],dy=b[1]-a[1];
  const t=Math.max(0,Math.min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dy)/(dx*dx+dy*dy||1)));
  return Math.hypot(point[0]-a[0]-dx*t,point[1]-a[1]-dy*t);
}
function distanceToRoute(point,path) {
  return Math.min(...path.slice(1).map((p,i)=>distanceToSegment(point,path[i],p)));
}
test('focused units travel on the visible vessels assigned to the chosen region',()=>{
  for(const target of TARGETS.filter(t=>t.id!=='whole')) for(let i=0;i<56;i++) {
    const p=botPosition(i,35,target.id);
    const distances=REGION_ROUTES[target.id].map(route=>distanceToRoute(p,BODY_PATHS[route]));
    assert.ok(Math.min(...distances)<1e-8);
  }
  assert.ok(botPosition(0,35,'legs')[1]>botPosition(0,35,'head')[1]+250);
});

test('all units enter from the same arm point and phase boundaries never teleport',()=>{
  for(let i=0;i<56;i++) {
    assert.deepEqual(botPosition(i,0,'whole'),[164,225]);
    for(const target of TARGETS) for(const boundary of [12,24,27,50,53,60]) {
      const before=botPosition(i,boundary-.00001,target.id);
      const after=botPosition(i,boundary,target.id);
      assert.ok(Math.hypot(after[0]-before[0],after[1]-before[1])<.01,`${i} ${target.id} ${boundary}`);
    }
  }
});

test('completed patrol stays distributed across the body rather than regrouping',()=>{
  const positions=Array.from({length:56},(_,i)=>botPosition(i,60,'chest'));
  assert.ok(positions.some(([x,y])=>y<65));
  assert.ok(positions.some(([x,y])=>y>450));
  assert.ok(positions.some(([x,y])=>x<160));
  assert.ok(positions.some(([x,y])=>x>320));
  for(let i=0;i<56;i++) {
    assert.deepEqual(positions[i],patrolPosition(i));
    assert.deepEqual(positions[i],botPosition(i,100,'whole'));
  }
  assert.equal(missionState(60,'complete').patrolling,true);
  assert.ok(missionState(18,'running').veinOpacity>missionState(0,'idle').veinOpacity);
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
