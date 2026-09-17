export const SWARM_SIZE = 1200;
// Smooth the vessel centerlines once; renderers and particles share the exact result.
function smoothPolyline(points) {
  const result=[];
  for(let i=0;i<points.length-1;i++) {
    const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(points.length-1,i+2)];
    for(let j=0;j<8;j++) {
      const t=j/8;
      result.push([0,1].map(k=>.5*(2*b[k]+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t*t+(-a[k]+3*b[k]-3*c[k]+d[k])*t*t*t)));
    }
  }
  result.push(points.at(-1));
  return result;
}
export const TARGETS = [
  { id: 'whole', label: 'Cuerpo completo', point: [240, 205] },
  { id: 'head', label: 'Cabeza', point: [240, 61] },
  { id: 'chest', label: 'Tórax', point: [245, 153] },
  { id: 'abdomen', label: 'Abdomen', point: [240, 236] },
  { id: 'arms', label: 'Brazos', point: [164, 225] },
  { id: 'legs', label: 'Piernas', point: [219, 379] },
];
export const PHASES = [
  { id: 'entry', title: 'Entrada', from: 0, to: 12, text: 'Todas las unidades parten del mismo punto del antebrazo y siguen la primera vía de luz.' },
  { id: 'explore', title: 'Recorrido', from: 12, to: 24, text: 'La red vascular aparece y el enjambre se distribuye por sus ramificaciones.' },
  { id: 'focus', title: 'Renovación', from: 24, to: 50, text: 'Sigue las luces hacia la zona elegida. Puedes hacer más transparente el cuerpo para ver su recorrido.' },
  { id: 'patrol', title: 'Vigilancia', from: 50, to: 60, text: 'Las unidades toman posiciones por todo el mapa y permanecen distribuidas al terminar.' },
];
export const ENTRY_PATH = smoothPolyline([[164,225],[174,199],[181,164],[193,135],[217,126],[235,138],[245,153]]);
const HEART=[245,153];
// Every moving point uses these same centerlines drawn by VascularLayer.
export const BODY_PATHS = [
  [HEART,[236,133],[230,109],[228,89],[227,67],[233,44],[239,38]],
  [HEART,[245,125],[251,103],[252,81],[251,61],[247,43],[240,38]],
  [HEART,[234,135],[215,126],[194,135],[181,164],[174,199],[164,225],[153,258],[145,278]],
  [HEART,[234,135],[215,126],[194,135],[181,164],[182,194],[170,227],[159,257],[153,283]],
  [HEART,[257,133],[275,128],[292,143],[300,172],[311,205],[323,234],[333,266],[338,285]],
  [HEART,[257,133],[275,128],[292,143],[297,175],[301,208],[313,239],[322,268],[326,286]],
  [HEART,[236,171],[234,198],[239,220],[220,232],[212,244],[226,253]],
  [HEART,[251,175],[249,199],[244,220],[263,231],[270,244],[254,253]],
  [HEART,[241,187],[239,225],[240,264],[222,283],[214,314],[217,350],[220,381],[212,415],[216,457],[208,471]],
  [HEART,[241,187],[239,225],[240,264],[224,288],[228,320],[225,350],[229,389],[224,430],[224,457],[226,472]],
  [HEART,[241,187],[239,225],[240,264],[258,283],[266,314],[263,350],[260,381],[268,415],[264,457],[272,471]],
  [HEART,[241,187],[239,225],[240,264],[256,288],[252,320],[255,350],[251,389],[256,430],[256,457],[254,472]],
  [HEART,[229,152],[213,147],[202,157],[218,171],[228,185]],
  [HEART,[262,146],[277,153],[271,171],[259,181]],
].map(smoothPolyline);
export const REGION_ROUTES={head:[0,1],chest:[12,13],abdomen:[6,7],arms:[2,3,4,5],legs:[8,9,10,11]};
export const VEIN_BRANCHES = [
  [[228,89],[217,74],[220,56]],[[252,81],[262,70],[258,53]],
  [[230,109],[215,117],[203,124]],[[251,103],[265,117],[278,125]],
  [[181,164],[172,157],[171,140]],[[300,172],[310,164],[308,145]],
  [[174,199],[162,204],[153,227],[144,248]],[[311,205],[325,219],[334,247]],
  [[153,258],[145,267],[136,276]],[[153,258],[150,275],[147,291]],
  [[159,257],[161,275],[159,293]],[[159,257],[168,276],[167,288]],
  [[333,266],[346,277],[349,286]],[[333,266],[337,282],[338,296]],
  [[322,268],[321,285],[323,296]],[[322,268],[313,281],[314,291]],
  [[234,198],[220,192],[208,201]],[[249,199],[263,193],[275,201]],
  [[239,220],[219,213],[209,223]],[[244,220],[263,214],[274,224]],
  [[240,264],[218,262],[208,280]],[[240,264],[262,262],[272,280]],
  [[214,314],[206,301],[204,288]],[[266,314],[274,301],[276,288]],
  [[217,350],[207,357],[209,375]],[[263,350],[273,357],[271,375]],
  [[220,381],[210,392],[207,414],[212,435]],[[260,381],[270,392],[273,414],[268,435]],
  [[216,457],[214,468],[218,478]],[[264,457],[266,468],[262,478]],
].map(smoothPolyline);
export function missionState(elapsed,status) {
  const time=Math.max(0,Math.min(60,Number(elapsed)||0));
  const phaseIndex=PHASES.findIndex(p=>time<p.to);
  const index=phaseIndex===-1?PHASES.length-1:phaseIndex;
  return {phase:PHASES[index],index,deployed:status==='idle'?0:Math.round(SWARM_SIZE*Math.min(1,time/12)),renewal:Math.round(Math.max(0,Math.min(1,(time-24)/26))*100),moving:status==='running',patrolling:status==='complete',veinOpacity:status==='idle'?.12:.18+.7*Math.min(1,time/18)};
}
const metricCache=new WeakMap();
export function pointOnPath(path,fraction) {
  if(fraction<=0)return path[0];
  if(fraction>=1)return path.at(-1);
  let metrics=metricCache.get(path);
  if(!metrics) {
    const lengths=path.slice(1).map((p,i)=>Math.hypot(p[0]-path[i][0],p[1]-path[i][1]));
    metrics={lengths,total:lengths.reduce((a,b)=>a+b,0)};
    metricCache.set(path,metrics);
  }
  const {lengths,total}=metrics;
  let distance=Math.max(0,Math.min(1,fraction))*total;
  for(let i=0;i<lengths.length;i++) {
    if(distance<=lengths[i]||i===lengths.length-1) {
      const ratio=lengths[i]?distance/lengths[i]:0;
      return [path[i][0]+(path[i+1][0]-path[i][0])*ratio,path[i][1]+(path[i+1][1]-path[i][1])*ratio];
    }
    distance-=lengths[i];
  }
  return path[0];
}
const tourFraction=(index,time)=>(1-Math.cos(Math.max(0,time)*(.31+index%9*.019)))/2;
function focusPosition(index,time,target) {
  const regular=BODY_PATHS[index%BODY_PATHS.length];
  const options=REGION_ROUTES[target];
  if(!options||time<24)return pointOnPath(regular,tourFraction(index,time-12));
  if(time<27)return pointOnPath(regular,tourFraction(index,12)*(1-(time-24)/3));
  return pointOnPath(BODY_PATHS[options[index%options.length]],tourFraction(index,time-27));
}
export function patrolPosition(index) {
  const fraction=[.35,.55,.78,.97][Math.floor(index/BODY_PATHS.length)%4];
  return pointOnPath(BODY_PATHS[index%BODY_PATHS.length],fraction);
}
export function botPosition(index,elapsed,targetId='whole') {
  const time=Math.max(0,Math.min(60,Number(elapsed)||0));
  if(time<12)return pointOnPath(ENTRY_PATH,Math.min(1,Math.max(0,(time-index%12*.32)/7.5)));
  if(time<50)return focusPosition(index,time,targetId);
  if(time<53) {
    const options=REGION_ROUTES[targetId];
    const route=BODY_PATHS[options?options[index%options.length]:index%BODY_PATHS.length];
    const fraction=tourFraction(index,options?23:38);
    return pointOnPath(route,fraction*(1-(time-50)/3));
  }
  const destination=[.35,.55,.78,.97][Math.floor(index/BODY_PATHS.length)%4];
  const mix=Math.min(1,(time-53)/7);
  return pointOnPath(BODY_PATHS[index%BODY_PATHS.length],destination*(1-Math.pow(1-mix,2)));
}
