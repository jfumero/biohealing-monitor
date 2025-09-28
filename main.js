/* === Paciente por querystring === */
const qs = new URLSearchParams(location.search);
const patientName = qs.get('name') || 'Jonathan Fumero Mesa';
const dob = qs.get('dob');
const birth = dob ? new Date(dob) : new Date(1976,11,4,0,50,0);

/* === Estado órganos (localStorage) === */
const ORGANS = [
  "Cerebro","Corazón","Pulmones","Hígado","Riñones",
  "Páncreas","Intestino","Sistema Inmune","Piel","Músculos",
  "Sistema Nervioso","Sistema Endócrino"
];
const LS_KEY = "biohealing_progress_v1";
let organState = ORGANS.map(name => ({ name, pct: 0 }));
function loadState(){ try{ const raw=localStorage.getItem(LS_KEY); if(raw){ const saved=JSON.parse(raw); if(Array.isArray(saved)&&saved.length===ORGANS.length) organState=saved; } }catch{} }
function saveState(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(organState)); }catch{} }
loadState();

/* === Refs UI === */
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('start-btn');
const skipBtn  = document.getElementById('skip-btn');
const injectSeq = document.getElementById('inject-seq');
const injectFill = document.getElementById('inject-fill');
const injectCount = document.getElementById('inject-count');

const patientNameEl = document.getElementById('patient-name');
const patientAgeEl  = document.getElementById('patient-age');

const routineSel = document.getElementById('routine');
const optimizeBtn = document.getElementById('optimize-btn');
const powerBtn = document.getElementById('power-btn');
const soundBtn = document.getElementById('sound-btn');
const resetBtn = document.getElementById('reset-btn');

const organsGrid = document.getElementById('organs-grid');
const organsBanner = document.getElementById('organs-banner');
const organsFill = document.getElementById('organs-progressbar-fill');
const organsSummary = document.getElementById('organs-progress-summary');

/* Gauges */
const bpVal = document.getElementById('bp-val');
const o2Val = document.getElementById('o2-val');
const stressVal = document.getElementById('stress-val');
const energyVal = document.getElementById('energy-val');

/* Respiración */
const breathPanel = document.getElementById('breath-panel');
const breathVisual = document.getElementById('breath-visual');
const breathStepEl = document.getElementById('breath-step');
const breathCountEl = document.getElementById('breath-count');
const breathBtn = document.getElementById('breath-btn');
const breathToggle = document.getElementById('breath-toggle');
const breathClose = document.getElementById('breath-close');

/* === Audio (OFF por defecto) === */
let audioCtx, masterGain, humOsc;
let soundOn = false;
async function ensureAudio(){
  if (!audioCtx){
    audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.0009;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state==='suspended'){ try{ await audioCtx.resume(); }catch{} }
}
function startHum(){
  stopHum();
  if (!soundOn) return;
  humOsc = audioCtx.createOscillator();
  humOsc.type='sine'; humOsc.frequency.value=72;
  const g=audioCtx.createGain(); g.gain.value=0.02;
  humOsc.connect(g).connect(masterGain); humOsc.start();
}
function stopHum(){ try{ humOsc && humOsc.stop(); }catch{} humOsc=null; }
function beep(ms=120, freq=440){
  if (!soundOn || !audioCtx) return;
  const o=audioCtx.createOscillator(); o.frequency.value=freq;
  const g=audioCtx.createGain(); g.gain.value=0.08;
  o.connect(g).connect(masterGain); o.start();
  setTimeout(()=>{ try{o.stop();}catch{} }, ms);
}

/* === Canvas efecto === */
const FX = (()=> {
  const cvs = document.getElementById('bloodstream-canvas');
  const ctx = cvs.getContext('2d', { alpha:true });
  let W=innerWidth, H=innerHeight, DPR = Math.min(devicePixelRatio||1, 2);
  let running=false, raf=0;
  let bots=[], cells=[];

  function resize(){
    W=innerWidth; H=innerHeight; DPR=Math.min(devicePixelRatio||1,2);
    cvs.width = Math.floor(W*DPR); cvs.height = Math.floor(H*DPR);
    cvs.style.width=W+'px'; cvs.style.height=H+'px';
  }
  addEventListener('resize', resize);

  function initField(){
    bots.length=0; cells.length=0;
    const baseBots=120, baseCells=30;
    const isMobile = innerWidth<520;
    const scale = isMobile?0.45:(innerWidth<900?0.7:1);
    const nb = Math.max(40, Math.round(baseBots*scale));
    const nc = Math.max(12, Math.round(baseCells*scale));

    for(let i=0;i<nb;i++){
      bots.push({
        x: Math.random()*W, y: Math.random()*H,
        vx: (Math.random()-.5)*0.6, vy:(Math.random()-.5)*0.6,
        r: 1.2 + Math.random()*1.2
      });
    }
    for(let i=0;i<nc;i++){
      cells.push({
        x: Math.random()*W, y: Math.random()*H,
        vx: (Math.random()-.5)*0.25, vy:(Math.random()-.5)*0.25,
        r: 5 + Math.random()*9, a: Math.random()*Math.PI*2
      });
    }
  }

  function step(){
    ctx.clearRect(0,0,cvs.width,cvs.height);
    ctx.save(); ctx.scale(DPR,DPR);

    const grd = ctx.createRadialGradient(W*0.3,H*0.2,20, W*0.3,H*0.2, W*0.8);
    grd.addColorStop(0,'rgba(16,185,129,.16)'); grd.addColorStop(1,'transparent');
    ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);

    ctx.globalAlpha=.22; ctx.fillStyle='#34d399';
    for(const c of cells){
      c.x+=c.vx; c.y+=c.vy; c.a+=0.01;
      if (c.x<-20) c.x=W+20; if (c.x>W+20) c.x=-20;
      if (c.y<-20) c.y=H+20; if (c.y>H+20) c.y=-20;
      ctx.beginPath(); ctx.ellipse(c.x,c.y,c.r*1.3,c.r,c.a,0,Math.PI*2); ctx.fill();
    }

    ctx.globalAlpha=.75;
    for(const b of bots){
      b.x+=b.vx; b.y+=b.vy;
      if (b.x<0||b.x>W) b.vx*=-1;
      if (b.y<0||b.y>H) b.vy*=-1;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
      ctx.fillStyle='rgba(52,211,153,.9)'; ctx.fill();
    }

    ctx.restore();
    if (running) raf=requestAnimationFrame(step);
  }

  function start(){ if(running) return; running=true; resize(); initField(); step(); }
  function stop(){ running=false; cancelAnimationFrame(raf); }

  return { start, stop };
})();

document.addEventListener('visibilitychange', ()=>{
  if (document.hidden) FX.stop(); else if (isOn) FX.start();
});

/* === Paciente === */
function computeAge(date){
  const now = new Date();
  let y = now.getFullYear() - date.getFullYear();
  const m = now.getMonth() - date.getMonth();
  if (m<0 || (m===0 && now.getDate()<date.getDate())) y--;
  return y;
}
function renderPatient(){
  const nameEl=document.getElementById('patient-name');
  const ageEl=document.getElementById('patient-age');
  if (nameEl) nameEl.textContent = patientName;
  if (ageEl) ageEl.textContent = computeAge(birth);
}
renderPatient();

/* === Organs banner === */
function renderOrgans(){
  if (!organsGrid) return;
  organsGrid.innerHTML = '';
  let done = 0;
  organState.forEach((o, idx) => {
    if (o.pct >= 100) done++;
    const chip = document.createElement('div');
    chip.className = 'organ-chip' + (o.pct>=100 ? ' is-done' : '');
    chip.dataset.index = idx;

    const name = document.createElement('span');
    name.className = 'organ-chip__name';
    name.textContent = o.name;

    const bar = document.createElement('div');
    bar.className = 'organ-chip__bar';
    const fill = document.createElement('div');
    fill.className = 'organ-chip__fill';
    fill.style.width = Math.max(0, Math.min(100, o.pct)) + '%';
    bar.appendChild(fill);

    chip.appendChild(name);
    chip.appendChild(bar);
    organsGrid.appendChild(chip);
  });

  const pct = Math.round((done / organState.length) * 100);
  if (organsFill) organsFill.style.width = pct + '%';
  if (organsSummary) organsSummary.textContent = `${pct}% completado`;

  if (pct === 100 && organsBanner && !organsBanner.classList.contains('is-hidden')) {
    setTimeout(()=> organsBanner.classList.add('is-hidden'), 900);
  } else if (pct < 100 && organsBanner) {
    organsBanner.classList.remove('is-hidden');
  }
}
renderOrgans();

/* === Power & Gauges === */
let isOn = false;
function setPower(on){
  isOn = on;
  powerBtn.textContent = `Power: ${isOn ? 'ON' : 'OFF'}`;
  if (isOn) {
    FX.start();
    setGauge(bpVal, '120/80');
    setGauge(o2Val, '98%');
    setGauge(stressVal, 'Bajo');
    setGauge(energyVal, 'Alta');
  } else {
    FX.stop();
    setGauge(bpVal, '—'); setGauge(o2Val, '—');
    setGauge(stressVal, '—'); setGauge(energyVal, '—');
  }
}
function setGauge(el, v){ if (el) el.textContent = v; }

/* === Rutinas === */
const ROUTINE_PRIORITIES = {
  default: ["Corazón","Pulmones","Cerebro","Sistema Inmune","Hígado"],
  sleep:   ["Sistema Nervioso","Sistema Endócrino","Cerebro","Pulmones","Corazón"],
  focus:   ["Cerebro","Sistema Nervioso","Pulmones","Corazón","Páncreas"],
  energy:  ["Energía","Corazón","Pulmones","Músculos","Hígado"]
};
function pickOrganIndexByRoutine(){
  const routine = routineSel?.value || 'default';
  const prefs = ROUTINE_PRIORITIES[routine] || ROUTINE_PRIORITIES.default;
  const ENERGY_MAP = ["Músculos","Hígado","Páncreas"];
  const pending = organState.map((o,i)=>({...o,i})).filter(o=>o.pct<100);
  if (!pending.length) return -1;
  for (const p of prefs){
    const names = p==='Energía' ? ENERGY_MAP : [p];
    const found = pending.find(o => names.includes(o.name));
    if (found) return found.i;
  }
  return pending[0].i;
}
function stepOptimization(){
  const idx = pickOrganIndexByRoutine();
  if (idx < 0){ renderOrgans(); return; }
  const inc = 6 + Math.random()*8; // 6–14%
  organState[idx].pct = Math.min(100, organState[idx].pct + inc);
  beep(40, 520 + Math.random()*60);
  saveState(); renderOrgans();
}
function burstOptimization(times=3, delay=450){
  let n=times; const t=setInterval(()=>{ stepOptimization(); if(--n<=0) clearInterval(t); }, delay);
}

/* === Inyección === */
async function runInjection(){
  if (!injectSeq) return;
  injectSeq.hidden = false;
  injectFill.style.width = '0%';
  injectCount.textContent = '3';
  let p=0; const timer=setInterval(()=>{ p+=100/12; injectFill.style.width=Math.min(100,p)+'%'; },100);
  const step = () => new Promise(res=>setTimeout(res,400));
  await step(); injectCount.textContent='2';
  await step(); injectCount.textContent='1';
  await step(); injectCount.textContent='¡Listo!';
  clearInterval(timer);
  setTimeout(()=> injectSeq.hidden = true, 380);
}

/* === Respiración guiada (con autocierre a 5 min) === */
let breathing=false, breathTimer=null, phase=0, count=4;
let autoCloseTimer=null; // cierra el panel a los 5 minutos
const PHASES = ['Inhala','Mantén','Exhala','Mantén'];

function renderBreath(){
  breathStepEl.textContent = PHASES[phase];
  breathCountEl.textContent = count;
  let scale = 1;
  if (PHASES[phase]==='Inhala') scale = 1.18;
  else if (PHASES[phase]==='Exhala') scale = 0.92;
  else scale = 1.05;
  breathVisual.style.transform = `scale(${scale})`;
}
function tickBreath(){
  if (!breathing) return;
  count--;
  if (count<=0){ phase=(phase+1)%4; count=4; }
  renderBreath();
}

function openBreath(){
  breathPanel.hidden = false;
  phase=0; count=4; renderBreath();
  // no arrancamos automáticamente; el usuario toca "Iniciar"
  clearTimeout(autoCloseTimer);
}
function startBreathing(){
  breathing = true;
  breathToggle.textContent = 'Pausar';
  clearInterval(breathTimer);
  breathTimer = setInterval(tickBreath, 1000);
  // Programa cierre automático a 5 minutos (300000 ms)
  clearTimeout(autoCloseTimer);
  autoCloseTimer = setTimeout(closeBreath, 300000);
}
function pauseBreathing(){
  breathing = false;
  breathToggle.textContent = 'Iniciar';
  clearInterval(breathTimer);
}
function closeBreath(){
  pauseBreathing();
  breathPanel.hidden = true;
  clearTimeout(autoCloseTimer);
}

breathBtn?.addEventListener('click', openBreath);
breathClose?.addEventListener('click', closeBreath);
breathToggle?.addEventListener('click', ()=>{
  if (!breathing) startBreathing(); else pauseBreathing();
});
document.addEventListener('keydown', (e)=>{
  if (!breathPanel.hidden && e.key === 'Escape') closeBreath();
});

/* === Eventos generales === */
startBtn?.addEventListener('click', async ()=>{
  await ensureAudio();
  await runInjection();
  overlay.classList.add('is-hidden');
  setPower(true);
  burstOptimization(3);
});
skipBtn?.addEventListener('click', ()=>{
  overlay.classList.add('is-hidden');
  setPower(true);
});
powerBtn?.addEventListener('click', ()=>{
  setPower(!isOn);
  if (isOn && soundOn) startHum(); else stopHum();
});
soundBtn?.addEventListener('click', async ()=>{
  await ensureAudio();
  soundOn = !soundOn;
  soundBtn.textContent = 'Sonido: ' + (soundOn ? 'ON' : 'OFF');
  soundBtn.setAttribute('aria-pressed', String(soundOn));
  if (isOn && soundOn) startHum(); else stopHum();
});
optimizeBtn?.addEventListener('click', ()=> burstOptimization(3));
routineSel?.addEventListener('change', ()=> beep(40, 460));
resetBtn?.addEventListener('click', ()=>{
  organState = ORGANS.map(name => ({ name, pct: 0 }));
  saveState(); renderOrgans(); beep(60, 420);
});

/* === Init === */
(function init(){
  renderPatient();
  setPower(false);
})();
