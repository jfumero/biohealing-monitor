/* ===== Config básica / datos ===== */
function makeLocalDate(y, m, d, hh, mm){ const dt = new Date(Date.UTC(y, m-1, d, hh, mm)); return new Date(dt.getTime()-3*3600*1000); }
const birth = makeLocalDate(1976,12,4,0,50);

/* ===== Utilidades accesibilidad ===== */
function setAriaPressed(btn, on){ if(!btn) return; btn.setAttribute('aria-pressed', on ? 'true' : 'false'); }

/* ===== Edad en vivo ===== */
function ageTextCompact(){
  const now=new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const after = (now.getMonth()>birth.getMonth()) || (now.getMonth()==birth.getMonth() && now.getDate()>=birth.getDate());
  if(!after) years--;
  return years + ' años';
}
function renderAge(){
  const txt = ageTextCompact();
  const a1 = document.getElementById('age'); if(a1) a1.textContent = txt;
  const a2 = document.getElementById('ov-age'); if(a2) a2.textContent = 'Edad: ' + txt;
}
setInterval(renderAge, 1000); renderAge();

/* ===== Zodiaco occidental / chino / elemento ===== */
const ZOD = ["Capricornio","Acuario","Piscis","Aries","Tauro","Géminis","Cáncer","Leo","Virgo","Libra","Escorpio","Sagitario"];
function zodiac(date){
  const m=date.getMonth()+1, d=date.getDate();
  const ranges=[[1,20,0],[2,19,1],[3,21,2],[4,20,3],[5,21,4],[6,21,5],[7,23,6],[8,23,7],[9,23,8],[10,23,9],[11,22,10],[12,22,11],[12,31,0]];
  for(let i=0;i<ranges.length;i++){ const [mm,dd,idx]=ranges[i]; if(m<mm||(m===mm&&d<dd)) return ZOD[(idx+11)%12]; }
  return ZOD[0];
}
const CH = ['Rata','Buey','Tigre','Conejo','Dragón','Serpiente','Caballo','Cabra','Mono','Gallo','Perro','Cerdo'];
function chineseAnimal(y){ return CH[(y - 1900) % 12]; }
function chineseElement(y){ const e=(y-4)%10; if(e===0||e===1) return 'Madera'; if(e===2||e===3) return 'Fuego'; if(e===4||e===5) return 'Tierra'; if(e===6||e===7) return 'Metal'; return 'Agua'; }

/* ===== Fase lunar / circadiano / biorritmos ===== */
function moonPhase(d){
  // algoritmo simple aproximado
  const lp=2551443; // segundos sinódicos
  const new_moon = Date.UTC(1970,0,7,20,35,0);
  const phase = ((d.getTime()-new_moon)/1000)%lp;
  const age = Math.floor(phase/(24*3600));
  if(age<1) return 'Luna nueva 🌑';
  if(age<7) return 'Creciente 🌒';
  if(age<8) return 'Cuarto creciente 🌓';
  if(age<14) return 'Gibosa creciente 🌔';
  if(age<15) return 'Luna llena 🌕';
  if(age<22) return 'Gibosa menguante 🌖';
  if(age<23) return 'Cuarto menguante 🌗';
  return 'Menguante 🌘';
}
function circadian(d){
  const h=d.getHours()+d.getMinutes()/60;
  if(h>=22||h<6) return 'Sueño / recuperación';
  if(h<9) return 'Activación matinal';
  if(h<12) return 'Alerta alta';
  if(h<14) return 'Bajada posalmuerzo';
  if(h<18) return 'Segundo pico de energía';
  return 'Desaceleración vespertina';
}
function biorr(d){
  const days = Math.floor((new Date(d.getFullYear(),d.getMonth(),d.getDate()) - new Date(birth.getFullYear(),birth.getMonth(),birth.getDate()))/86400000);
  const f = p => Math.round(Math.sin(2*Math.PI*days/p)*100);
  return { phy:f(23), emo:f(28), intel:f(33) };
}
function colorFor(v){ return v>30?'ok': v>-30?'warn':'bad'; }

/* ===== Render HUD ===== */
function renderHUD(){
  const now=new Date();
  document.getElementById('hud-zodiac').textContent = zodiac(now);
  document.getElementById('hud-chinese').textContent = chineseAnimal(birth.getFullYear());
  document.getElementById('hud-element').textContent = chineseElement(birth.getFullYear());
  document.getElementById('hud-moon').textContent = moonPhase(now);
  document.getElementById('hud-circadian').textContent = circadian(now);

  const {phy,emo,intel} = biorr(now);
  const p1 = document.getElementById('bio-phy'); p1.textContent = `Físico: ${phy}%`; p1.className = `value ${colorFor(phy)}`;
  const p2 = document.getElementById('bio-emo'); p2.textContent = `Emocional: ${emo}%`; p2.className = `value ${colorFor(emo)}`;
  const p3 = document.getElementById('bio-int'); p3.textContent = `Intelectual: ${intel}%`; p3.className = `value ${colorFor(intel)}`;
}
setInterval(renderHUD, 1000); renderHUD();

/* ===== Grid de módulos ===== */
const MODULES = [
  { id:'org-internos',  title:'Órganos internos', target: 0.92 },
  { id:'org-externos',  title:'Órganos externos', target: 0.90 },
  { id:'azucar',        title:'Regulación de azúcar', target: 0.88 },
  { id:'globulos',      title:'Glóbulos / Inmunidad', target: 0.94 },
  { id:'presion',       title:'Presión arterial', target: 0.91 },
  { id:'detox',         title:'Detox hepático', target: 0.89 }
];

function gauge(angleDeg){ return `translateX(-50%) rotate(${angleDeg}deg)`; }

function renderModules(){
  const grid = document.getElementById('grid'); grid.innerHTML='';
  MODULES.forEach(m=>{
    const el = document.createElement('section');
    el.className = 'module';
    el.id = `mod-${m.id}`;
    el.innerHTML = `
      <div class="head">
        <div class="state"><span class="dot" id="${m.id}-dot"></span><b>${m.title}</b></div>
        <div class="actions">
          <button class="btn tiny btn-activar" aria-label="Activar módulo">Activar</button>
          <button class="btn tiny btn-detener" aria-label="Detener módulo">Detener</button>
        </div>
      </div>
      <div class="gauge">
        <div class="needle" id="${m.id}-needle"></div>
        <div class="pct" id="${m.id}-pct">0%</div>
      </div>
    `;
    grid.appendChild(el);
  });
}
renderModules();

const state = {
  power: false,
  sound: false,
  modules: Object.fromEntries(MODULES.map(m=>[m.id, {active:false, value:0}])),
  timers: { anim: [], ov: null },
};

/* ===== Audio mínimo (hum + beep) ===== */
let audioCtx, humOsc, humGain;
function startAudio(){
  if(audioCtx) return;
  try {
    audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    humOsc = audioCtx.createOscillator(); humOsc.type='sawtooth'; humOsc.frequency.value=65;
    humGain = audioCtx.createGain(); humGain.gain.value = 0.02;
    humOsc.connect(humGain).connect(audioCtx.destination);
    if(state.sound) humOsc.start();
  } catch(e){ console.warn('Audio no disponible:', e); }
}
function toggleHum(on){
  if(!audioCtx || !humOsc) return;
  if(on){ try{ humOsc.start(); }catch{} }
  else { try{ humOsc.stop(); humOsc = null; }catch{} }
}
function beep(){
  if(!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type='square'; o.frequency.value=740;
  g.gain.value=0.03;
  o.connect(g).connect(audioCtx.destination);
  o.start(); setTimeout(()=>{o.stop();}, 90);
}

/* ===== Power / Sonido / Optimizar ===== */
const btnPower = document.getElementById('btnPower');
const btnSound = document.getElementById('btnSound');
const btnOptimize = document.getElementById('btnOptimize');
const led = document.getElementById('led');

function setPower(on){
  state.power = on;
  setAriaPressed(btnPower, on);
  led.style.background = on ? '#2ad37a' : '#a33';
  led.style.boxShadow = on ? '0 0 12px #2ad37a' : '0 0 12px #a33';
  document.querySelectorAll('.module .btn-activar, .module .btn-detener').forEach(b=>b.disabled = !on);
  if(on){ renderHUD(); startBloodstream(); } else { stopBloodstream(); resetModules(); }
}
btnPower.addEventListener('click', ()=> {
  if(!audioCtx) startAudio();
  setPower(!state.power);
  if(state.sound) beep();
});

btnSound.addEventListener('click', async ()=>{
  if(!audioCtx) startAudio();
  state.sound = !state.sound;
  setAriaPressed(btnSound, state.sound);
  if(state.sound) { try{ audioCtx.resume(); }catch{} }
  if(state.sound) beep();
});

btnOptimize.addEventListener('click', ()=> openOptimizer());

/* ===== Overlay ===== */
const overlay = document.getElementById('overlay');
document.getElementById('btnStart').addEventListener('click', ()=>{
  overlay.style.display='none';
  if(!audioCtx) startAudio();
  setPower(true);
  if(state.sound) beep();
});
document.getElementById('btnStartOptimize').addEventListener('click', ()=>{
  overlay.style.display='none';
  if(!audioCtx) startAudio();
  setPower(true); openOptimizer();
  if(state.sound) beep();
});
setTimeout(()=>{ if(overlay.style.display!=='none'){ overlay.style.display='none'; setPower(true); } }, 15000);

/* ===== Checklist (aria-live) ===== */
function setCheck(id, pct){
  const wrap = document.getElementById('checklist');
  const value = Math.max(0, Math.min(100, Math.round(pct)));
  const tone = value>=70?'ok': value>=40?'warn':'bad';
  const map = {
    scan: 'Escaneo sistémico',
    torrente: 'Recuento en torrente sanguíneo',
    operativos: 'Nanorobots operativos',
    autorreparacion: 'Autorreparación celular',
    depuracion: 'Depuración de toxinas'
  };
  const existing = document.getElementById(`check-${id}`);
  const html = `<span>${map[id]||id}</span><span class="badge ${tone}">${value}%</span>`;
  if(existing){ existing.innerHTML = html; }
  else {
    const row = document.createElement('div');
    row.id = `check-${id}`; row.className = 'check';
    row.innerHTML = html;
    wrap.appendChild(row);
  }
}

/* ===== Módulos: activar/detener y animación de gauges ===== */
function resetModules(){
  MODULES.forEach(m=>{
    state.modules[m.id].active = false; state.modules[m.id].value = 0;
    updateModuleUI(m.id, 0, false);
  });
}
function updateModuleUI(id, value, active){
  const pct = Math.round(value*100);
  const needle = document.getElementById(`${id}-needle`);
  const dot = document.getElementById(`${id}-dot`);
  const txt = document.getElementById(`${id}-pct`);
  if(needle){ const deg = -90 + (pct*1.8); needle.style.transform = gauge(deg); }
  if(txt){ txt.textContent = `${pct}%`; }
  if(dot){ dot.className = 'dot ' + (active ? 'ok' : (pct>20?'warn':'')); }
}
function animateValue(id, target){
  const mod = state.modules[id];
  const step = ()=>{
    if(!state.power) return;
    const diff = target - mod.value;
    if(Math.abs(diff)<0.002){ mod.value = target; updateModuleUI(id, mod.value, mod.active); return; }
    mod.value += diff*0.08;
    updateModuleUI(id, mod.value, mod.active);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function bindModuleButtons(){
  document.querySelectorAll('.module').forEach(el=>{
    const id = el.id.replace('mod-','');
    const btnOn = el.querySelector('.btn-activar');
    const btnOff = el.querySelector('.btn-detener');
    btnOn.disabled = !state.power; btnOff.disabled = !state.power;
    btnOn.addEventListener('click', ()=>{
      if(!state.power) return;
      state.modules[id].active = true;
      animateValue(id, MODULES.find(m=>m.id===id).target);
      if(state.sound) beep();
    });
    btnOff.addEventListener('click', ()=>{
      if(!state.power) return;
      state.modules[id].active = false;
      animateValue(id, 0.10);
      if(state.sound) beep();
    });
  });
}
bindModuleButtons();

/* ===== Optimizer (cola) ===== */
const optimizer = document.getElementById('optimizer');
const optQueueEl = document.getElementById('opt-queue');
const btnCloseOpt = document.getElementById('btnCloseOpt');

const OPT_ITEMS = [
  'Nutrientes esenciales', 'Hormonas reguladoras', 'Sistema inmune',
  'Hábitos circadianos', 'Oxigenación celular', 'Núcleo celular'
];

function openOptimizer(){
  optimizer.classList.add('open');
  optimizer.setAttribute('aria-hidden','false');
  runQueue();
}
btnCloseOpt.addEventListener('click', closeOptimizer);
function closeOptimizer(){
  optimizer.classList.remove('open');
  optimizer.setAttribute('aria-hidden','true');
  optQueueEl.innerHTML='';
}
async function runQueue(){
  optQueueEl.innerHTML='';
  for(const name of OPT_ITEMS){
    const row = document.createElement('div');
    row.className = 'opt-item';
    row.innerHTML = `<span class="opt-name">${name}</span><div class="progress"><div class="bar"></div></div>`;
    optQueueEl.appendChild(row);
    const bar = row.querySelector('.bar');
    let v=0;
    await new Promise(res=>{
      const t = setInterval(()=>{
        v += Math.random()*18+8;
        if(v>=100){ v=100; clearInterval(t); }
        bar.style.width = v+'%';
        if(v===100) res();
      }, 130);
    });
    setCheck('scan', 60 + Math.round(Math.random()*40));
    setCheck('torrente', 60 + Math.round(Math.random()*40));
    setCheck('operativos', 60 + Math.round(Math.random()*40));
    setCheck('autorreparacion', 60 + Math.round(Math.random()*40));
    setCheck('depuracion', 60 + Math.round(Math.random()*40));
  }
}

/* ===== Bloodstream FX (canvas) ===== */
const fx = document.getElementById('fx');
let fxCtx, fxRAF, particles=[];
function startBloodstream(){
  if(!fxCtx){ fx.width = innerWidth*devicePixelRatio; fx.height = innerHeight*devicePixelRatio; fxCtx = fx.getContext('2d'); fxCtx.scale(devicePixelRatio, devicePixelRatio); initParticles(); }
  cancelAnimationFrame(fxRAF);
  loopFX();
}
function stopBloodstream(){ cancelAnimationFrame(fxRAF); }
function initParticles(){
  particles = [];
  const N = Math.min(160, Math.round(innerWidth*innerHeight/12000));
  for(let i=0;i<N;i++){
    particles.push({
      x: Math.random()*innerWidth, y: Math.random()*innerHeight,
      vx: (Math.random()*0.6+0.2), vy: (Math.random()-0.5)*0.4,
      r: Math.random()*1.8+0.6, a: Math.random()*0.6+0.25
    });
  }
}
function loopFX(){
  fxRAF = requestAnimationFrame(loopFX);
  fxCtx.clearRect(0,0,innerWidth,innerHeight);
  fxCtx.globalCompositeOperation='lighter';
  for(const p of particles){
    p.x+=p.vx; p.y+=p.vy;
    if(p.x>innerWidth) p.x=0; if(p.y>innerHeight) p.y=0; if(p.y<0) p.y=innerHeight;
    fxCtx.beginPath(); fxCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
    fxCtx.fillStyle=`rgba(100,180,255,${p.a})`; fxCtx.fill();
  }
}
addEventListener('visibilitychange', ()=>{ if(document.hidden) stopBloodstream(); else if(state.power) startBloodstream(); });
addEventListener('resize', ()=>{ fx.width = innerWidth*devicePixelRatio; fx.height = innerHeight*devicePixelRatio; if(fxCtx){ fxCtx.setTransform(1,0,0,1,0,0); fxCtx.scale(devicePixelRatio, devicePixelRatio); initParticles(); } });

/* ===== Valores iniciales ===== */
(function init(){
  // valores overlay
  const total = 1000000 + Math.round(Math.random()*500000);
  const active = Math.round(total*(0.72+Math.random()*0.12));
  document.getElementById('ov-total').textContent = total.toLocaleString('es-UY');
  document.getElementById('ov-active').textContent = active.toLocaleString('es-UY');
  document.getElementById('ov-total-bar').style.width = '100%';
  document.getElementById('ov-active-bar').style.width = Math.round(active/total*100)+'%';

  // checklist base si el usuario no toca nada aún
  setCheck('scan', 12);
  setCheck('torrente', 24);
  setCheck('operativos', 18);
  setCheck('autorreparacion', 10);
  setCheck('depuracion', 12);
})();
