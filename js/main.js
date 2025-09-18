// ==================== AUDIO ====================

let audioCtx = null;
let masterGain = null;
let soundOn = false;

async function resumeAudio(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(audioCtx.destination);
  }
  if(audioCtx.state==='suspended') await audioCtx.resume();
}

function playBeep(freq=800, dur=120, vol=0.05){
  if(!audioCtx || !soundOn) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type='sine';
  o.frequency.value=freq;
  g.gain.value=vol;
  o.connect(g).connect(masterGain);
  const t=audioCtx.currentTime;
  o.start(t);
  o.stop(t+dur/1000);
}

function startHum(){
  if(!audioCtx || !soundOn) return;
  if(startHum._osc) return;
  const o=audioCtx.createOscillator();
  const g=audioCtx.createGain();
  o.type='sine';
  o.frequency.value=60;
  g.gain.value=0.01;
  o.connect(g).connect(masterGain);
  o.start();
  startHum._osc={o,g};
}

function stopHum(){
  if(!startHum._osc) return;
  try{startHum._osc.o.stop();}catch{}
  startHum._osc=null;
}

// ==== tono ascendente para el recuento ==== // NUEVO
function playAscending(ms=3200){
  if(!audioCtx || !soundOn) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type='sine';
  const t0 = audioCtx.currentTime;
  const t1 = t0 + (ms/1000);

  o.frequency.setValueAtTime(220, t0);
  o.frequency.exponentialRampToValueAtTime(1000, t1);

  g.gain.setValueAtTime(0.0, t0);
  g.gain.linearRampToValueAtTime(0.03, t0+0.15);
  g.gain.exponentialRampToValueAtTime(0.00001, t1);

  o.connect(g).connect(masterGain);
  o.start(t0);
  o.stop(t1 + 0.02);
}

// ==== tono ligado al gauge ==== // NUEVO
function startGaugeTone(card){
  if(!audioCtx || !soundOn || card._tone) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type='triangle';
  g.gain.value = 0.02;
  o.connect(g).connect(masterGain);
  o.start();
  card._tone = { o, g };
}
function stopGaugeTone(card){
  if(!card._tone) return;
  try{
    const t = audioCtx.currentTime;
    card._tone.g.gain.exponentialRampToValueAtTime(0.00001, t+0.12);
    card._tone.o.stop(t+0.14);
  }catch{}
  card._tone = null;
}
function mapPctToFreq(p){
  const pct = Math.max(0, Math.min(100, p||0));
  return 300 + (pct/100)*(1400-300);
}

// ==== ambiente retro ==== // NUEVO
let ambOn = false;
let blipTimer = null;

function startAmbient(){
  if(!audioCtx || !soundOn || ambOn) return;
  ambOn = true;
  startHum();

  const mkBlip = ()=>{
    if(!audioCtx || !ambOn || !soundOn) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'square';
    o.frequency.value = 900 + Math.random()*1500;
    g.gain.value = 0.015;
    o.connect(g).connect(masterGain);
    const t0 = audioCtx.currentTime;
    o.start(t0);
    g.gain.exponentialRampToValueAtTime(0.00001, t0 + 0.09);
    o.stop(t0 + 0.12);
  };

  const loop = ()=>{
    if(!ambOn) return;
    mkBlip();
    const next = 700 + Math.random()*700;
    blipTimer = setTimeout(loop, next);
  };
  loop();
}

function stopAmbient(){
  ambOn = false;
  if(blipTimer) { clearTimeout(blipTimer); blipTimer = null; }
  stopHum();
}

// Test rápido de audio con tecla "T" // NUEVO
document.addEventListener('keydown', async (e)=>{
  if(e.key.toLowerCase() === 't'){
    await resumeAudio();
    playBeep(1000, 0.2);
  }
});

// ==================== INIT ====================

function initWelcome(){
  // lógica inicial existente...
  playAscending(3400); // NUEVO
}

// ==================== GAUGES ====================

// Crea ticks 0..100 cada 10% (y minor cada 5%) // NUEVO
function buildTicks(){
  const wrap = document.createElement('div');
  wrap.className = 'ticks';
  const pctToAngle = p => -120 + (p*2.4);

  for(let p=5; p<100; p+=5){
    const t = document.createElement('div');
    t.className = 'tick';
    const ang = pctToAngle(p);
    t.style.transform = `rotate(${ang}deg) translateX(-50%)`;
    wrap.appendChild(t);
  }

  for(let p=0; p<=100; p+=10){
    const t = document.createElement('div');
    t.className = 'tick major';
    const ang = pctToAngle(p);
    t.style.transform = `rotate(${ang}deg) translateX(-50%)`;
    const lbl = document.createElement('div');
    lbl.className = 'tick-label';
    lbl.textContent = String(p);
    lbl.style.top = '-4px';
    t.appendChild(lbl);
    wrap.appendChild(t);
  }
  return wrap;
}

function createCard(mod){
  const card=document.createElement('div'); card.className='card';

  const gauge=document.createElement('div'); gauge.className='gauge';
  const dial=document.createElement('div'); dial.className='dial';
  const ticks = buildTicks(); // NUEVO
  const needle=document.createElement('div'); needle.className='needle';
  const hub=document.createElement('div'); hub.className='hub';
  const value=document.createElement('div'); value.className='value';

  // cambia el orden del append // NUEVO
  gauge.append(dial, ticks, needle, hub, value);

  function start(){
    if(!isOn||card._active) return;
    card._active=true;
    startGaugeTone(card);   // NUEVO
    animateTo(card,goal);
    playBeep();
  }

  function stop(){
    clearInterval(card._timer); card._active=false;
    stopGaugeTone(card);    // NUEVO
    card._timer=setInterval(()=>{
      let cur=Number(card.dataset.current||10);
      cur -= Math.max(0.8,(cur-10)*0.06);
      if(cur<=10){cur=10;setVisual(card,cur,false);clearInterval(card._timer);}
      else setVisual(card,cur,false);
    },90);
  }

  card.start=start; card.stop=stop;
  card.append(gauge);
  return card;
}

function animateTo(card, goal){
  clearInterval(card._timer);
  let cur=Number(card.dataset.current||10);
  card._timer=setInterval(()=>{
    cur += (goal-cur)*0.1;
    if(card._tone && audioCtx){ // NUEVO
      const freq = mapPctToFreq(cur);
      try {
        card._tone.o.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.05);
      } catch {}
    }
    if(Math.abs(goal-cur)<0.6){
      cur=goal; setVisual(card,cur,true);
      clearInterval(card._timer); card._active=false;
      stopGaugeTone(card); // NUEVO
    } else {
      setVisual(card,cur,true);
    }
  },90);
}

// ==================== POWER & SOUND ====================

const ambBtn = document.getElementById('amb-btn');
if(ambBtn){
  ambBtn.addEventListener('click', async ()=>{
    await resumeAudio();
    const next = ambBtn.getAttribute('aria-pressed') !== 'true';
    ambBtn.setAttribute('aria-pressed', String(next));
    ambBtn.textContent = 'Ambiente: ' + (next?'ON':'OFF');
    if(next){ startAmbient(); } else { stopAmbient(); }
  });
}

powerBtn.onclick=async ()=>{
  isOn=!isOn;
  if(!audioCtx) return;
  if(isOn && soundOn){
    if(ambBtn?.getAttribute('aria-pressed') === 'true') startAmbient();
    else startHum();
  }else{
    stopAmbient();
  }
};
