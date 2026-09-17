export const SWARM_SIZE = 1200;
export const TARGETS = [
  { id: 'whole', label: 'Cuerpo completo', point: [240, 205] },
  { id: 'head', label: 'Cabeza', point: [240, 65] },
  { id: 'chest', label: 'Tórax', point: [240, 167] },
  { id: 'abdomen', label: 'Abdomen', point: [240, 243] },
  { id: 'arms', label: 'Brazos', point: [166, 228] },
  { id: 'legs', label: 'Piernas', point: [222, 381] },
];
export const PHASES = [
  { id: 'entry', title: 'Entrada', from: 0, to: 12, text: 'El enjambre entra y se reúne en el centro del mapa.' },
  { id: 'explore', title: 'Recorrido', from: 12, to: 24, text: 'Sigue los caminos de luz y observa cómo se distribuyen.' },
  { id: 'focus', title: 'Renovación', from: 24, to: 50, text: 'Dirige tu atención a la zona elegida y acompaña el trabajo del enjambre.' },
  { id: 'return', title: 'Integración', from: 50, to: 60, text: 'Los puntos de luz se reúnen. Tómate un momento antes de continuar.' },
];
export const ENTRY_PATH = [[32,224],[91,224],[140,267],[164,235],[186,192],[200,143],[240,152]];
export const BODY_PATHS = [
  [[240,152],[240,111],[228,75],[240,49],[253,75],[240,111],[240,152]],
  [[240,152],[209,148],[204,192],[224,218],[240,239],[240,152]],
  [[240,152],[271,148],[276,192],[256,218],[240,239],[240,152]],
  [[240,152],[201,135],[183,191],[157,239],[140,267],[171,233],[199,170],[240,152]],
  [[240,152],[279,135],[297,191],[323,239],[340,267],[309,233],[281,170],[240,152]],
  [[240,152],[240,242],[222,286],[222,355],[214,449],[228,407],[233,310],[240,242],[240,152]],
  [[240,152],[240,242],[258,286],[258,355],[266,449],[252,407],[247,310],[240,242],[240,152]],
];

export function missionState(elapsed, status) {
  const time = Math.max(0, Math.min(60, Number(elapsed) || 0));
  const phaseIndex = PHASES.findIndex(p => time < p.to);
  const index = phaseIndex === -1 ? PHASES.length - 1 : phaseIndex;
  return {
    phase: PHASES[index], index,
    deployed: status === 'idle' ? 0 : Math.round(SWARM_SIZE * Math.min(1, time / 12)),
    renewal: Math.round(Math.max(0, Math.min(1, (time - 24) / 26)) * 100),
    moving: status === 'running',
  };
}

// A deterministic timeline keeps position stable on pause and independent of frame rate.
export function pointOnPath(path, fraction) {
  if (fraction <= 0) return path[0];
  if (fraction >= 1) return path[path.length - 1];
  const lengths = path.slice(1).map((p,i)=>Math.hypot(p[0]-path[i][0],p[1]-path[i][1]));
  let distance = Math.max(0,Math.min(1,fraction))*lengths.reduce((a,b)=>a+b,0);
  for(let i=0;i<lengths.length;i++) {
    if(distance<=lengths[i] || i===lengths.length-1) {
      const ratio=lengths[i] ? distance/lengths[i] : 0;
      return [path[i][0]+(path[i+1][0]-path[i][0])*ratio,path[i][1]+(path[i+1][1]-path[i][1])*ratio];
    }
    distance-=lengths[i];
  }
  return path[0];
}

export function botPosition(index, elapsed, targetId='whole') {
  const time = Math.max(0, Math.min(60, Number(elapsed) || 0));
  const start = index % 12 * .32;
  const route = BODY_PATHS[index % BODY_PATHS.length];
  const entry = pointOnPath(ENTRY_PATH, Math.min(1, Math.max(0,(time-start)/7.5)));
  if(time < 12) return entry;
  const routePoint = pointOnPath(route, ((time-12)/9 + index*.137) % 1);
  const arrival = Math.min(1,(time-12)/2);
  const traveling = ENTRY_PATH.at(-1).map((v,i)=>v+(routePoint[i]-v)*arrival);
  if(time < 24 || targetId==='whole' && time < 50) return traveling;
  const target = TARGETS.find(t=>t.id===targetId) || TARGETS[0];
  const angle = index * 2.39996 + time * .45;
  const radius = 8 + (index % 5) * 3;
  const orbit = [target.point[0] + Math.cos(angle)*radius,target.point[1]+Math.sin(angle)*radius];
  if(time < 50) {
    const mix = Math.min(1,(time-24)/2);
    return traveling.map((v,i)=>v+(orbit[i]-v)*mix);
  }
  const seed = targetId==='whole' ? pointOnPath(route, (38/9+index*.137)%1) : [target.point[0]+Math.cos(index*2.39996+50*.45)*radius,target.point[1]+Math.sin(index*2.39996+50*.45)*radius];
  const final = [240+Math.cos(index*2.39996)*(12+index%6*3),174+Math.sin(index*2.39996)*(12+index%6*3)];
  const mix = (time-50)/10;
  return seed.map((v,i)=>v+(final[i]-v)*mix);
}
