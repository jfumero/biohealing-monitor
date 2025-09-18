// ===========================
// BioHealing Monitor - main.js
// ===========================

// ===== Edad compacta =====
function makeLocalDate(y,m,d,hh,mm){const dt=new Date(Date.UTC(y,m-1,d,hh,mm));return new Date(dt.getTime()-3*3600*1000);}
const birth = makeLocalDate(1976,12,4,0,50);
function ageTextCompact(){
  const now=new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const afterBirthday = (now.getMonth()>birth.getMonth()) || (now.getMonth()==birth.getMonth() && now.getDate()>=birth.getDate());
  if(!afterBirthday) years--;
  return years+" años";
}
function renderAge(){
  const txt = ageTextCompact();
  const a1=document.getElementById('age'); if(a1) a1.textContent=txt;
  const a2=document.getElementById('ov-age'); if(a2) a2.textContent='Edad: '+txt;
}
setInterval(renderAge,1000); renderAge();

// ===== Audio (Web Audio) =====
let audioCtx = null, masterGain = null, humOsc = null, humGain = null;
let soundOn = true; // estado del botón Sonido

function ensureAudio(){
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.08; // volumen maestro audible (ajústalo a gusto)
  masterGain.connect(audioCtx.destination);
}
async function resumeAudio(){
  ensureAudio();
  try { await audioCtx.resume(); } catch {}
}

// Beep claro (útil para confirmar acciones)
function playBeep(freq = 880, dur = 0.20){
  if (!audioCtx || !soundOn) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'square';        // más presente que 'sine'
  o.frequency.value = freq;
  g.gain.value = 0.05;      // ganancia audible
  o.connect(g).connect(masterGain);
  const t0 = audioCtx.currentTime;
  o.start(t0);
  g.gain.exponentialRampToValueAtTime(0.00001, t0 + dur);
  o.stop(t0 + dur + 0.02);
}

// Zumbido de fondo muy suave
function startHum(){
  if (!audioCtx || humOsc || !soundOn) return;
  humOsc = audioCtx.createOscillator();
  humGain = audioCtx.createGain();
  humOsc.type = 'sawtooth';
  humOsc.frequency.value = 220; // más audible que 110 Hz
  humGain.gain.value = 0.01;    // hum perceptible
  humOsc.connect(humGain).connect(masterGain);
  humOsc.start();
}
function stopHum(){
  if (!humOsc) return;
  const t = audioCtx.currentTime;
  humGain.gain.exponentialRampToValueAtTime(0.00001, t + 0.2);
  humOsc.stop(t + 0.25);
  humOsc = null; humGain = null;
}

// Habilita audio en el primer toque (por políticas de autoplay)
document.addEventListener('pointerdown', async ()=>{ await resumeAudio(); }, { once:true });

// ===== Bio extra para bienvenida =====
const CHINESE=['Rata','Buey','Tigre','Conejo','Dragón','Serpiente','Caballo','Cabra','Mono','Gallo','Perro','Cerdo'];
function zodiac(d){const m=d.getMonth()+1,day=d.getDate();
if((m==3&&day>=21)||(m==4&&day<=19))return'Aries ♈';
if((m==4&&day>=20)||(m==5&&day<=20))return'Tauro ♉';
if((m==5&&day>=21)||(m==6&&day<=20))return'Géminis ♊';
if((m==6&&day>=21)||(m==7&&day<=22))return'Cáncer ♋';
if((m==7&&day>=23)||(m==8&&day<=22))return'Leo ♌';
if((m==8&&day>=23)||(m==9&&day<=22))return'Virgo ♍';
if((m==9&&day>=23)||(m==10&&day<=22))return'Libra ♎';
if((m==10&&day>=23)||(m==11&&day<=21))return'Escorpio ♏';
if((m==11&&day>=22)||(m==12&&day<=21))return'Sagitario ♐';
if((m==12&&day>=22)||(m==1&&day<=19))return'Capricornio ♑';
if((m==1&&day>=20)||(m==2&&day<=18))return'Acuario ♒';
return'Piscis ♓';}
function chinese(y){return CHINESE[(y-1900)%12];}
function moon(d){const syn=29.530588853,ref=new Date(Date.UTC(2000,0,6,18,14)),days=(d-ref)/86400000,age=((days%syn)+syn)%syn;
if(age<1.84566)return'Luna nueva 🌑';
if(age<5.53699)return'Creciente visible 🌒';
if(age<9.22831)return'Cuarto creciente 🌓';
if(age<12.91963)return'Gibosa creciente 🌔';
if(age<16.61096)return'Luna llena 🌕';
if(age<20.30228)return'Gibosa menguante 🌖';
if(age<23.99361)return'Cuarto menguante 🌗';
return'Creciente menguante 🌘';}
function circadian(d){const h=d.getHours()+d.getMinutes()/60;
if(h>=22||h<6)return'Sueño / recuperación';
if(h<9)return'Activación matinal';
if(h<12)return'Alerta alta';
if(h<14)return'Bajada posalmuerzo';
if(h<18)return'Segundo pico de energía';
return'Desaceleración vespertina';}

function biorr(d){
  const days=Math.floor((new Date(d.getFullYear(),d.getMonth(),d.getDate()) - new Date(birth.getFullYear(),birth.getMonth(),birth.getDate()))/86400000);
  const val=p=> (Math.round(Math.sin(2*Math.PI*days/p)*100))+'%';
  const f='Físico: '+val(23), e='Emocional: '+val(28), i='Intelectual: '+val(33);
  const z='Zodiaco: '+zodiac(new Date(1976,11,4));
  const cz='Chino: '+chinese(1976);
  const mn='Luna: '+moon(d);
  const cc='Circadiano: '+circadian(d);
  const q=(id,txt)=>{const el=document.getElementById(id); if(el) el.textContent=txt;};
  q('ov-bio-f',f); q('ov-bio-e',e); q('ov-bio-i',i);
  q('ov-zodiac',z); q('ov-czodiac',cz); q('ov-moon',mn); q('ov-circ',cc);
}
setInterval(()=>biorr(new Date()),60000); biorr(new Date());

// ===== Bienvenida: contadores + tono ascendente =====
function animateCounter(el,to,ms=3200){
  const start=0, t0=performance.now();
  function step(t){
    const k=Math.min(1,(t-t0)/ms);
    const eased=0.5-0.5*Math.cos(Math.PI*k);
    el.textContent=Math.round(start+(to-start)*eased).toLocaleString('es-UY');
    if(k<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
// tono ascendente para acompañar el recuento
function playAscending(ms=3400){
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

function initWelcome(){
  const base=12_000_000, ops=Math.floor(base*(0.90+Math.random()*0.06));
  const elT=document.getElementById('n-total'), elO=document.getElementById('n-op'), bar=document.getElementById('swarm-bar');
  if(elT) animateCounter(elT,base,3200);
  if(elO) animateCounter(elO,ops,3400);
  if(bar) setTimeout(()=>{ bar.style.width=Math.round(ops/base*100)+'%'; },700);
  // dispara tono ascendente (si ya hay permiso de audio)
  playAscending(3400);
}
initWelcome();

// ===== Power & overlay =====
const overlay=document.getElementById('overlay');
const startBtn=document.getElementById('startBtn');
const powerBtn=document.getElementById('power-btn');
const led=document.getElementById('led');
const soundBtn=document.getElementById('sound-btn');

let isOn=false;

if (soundBtn) {
  soundBtn.addEventListener('click', async () => {
    await resumeAudio();
    soundOn = !soundOn;
    soundBtn.textContent = 'Sonido: ' + (soundOn ? 'ON' : 'OFF');
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    if (isOn && soundOn) { startHum(); playBeep(1200, 0.12); } else { stopHum(); }
  });
}

startBtn.onclick = async () => {
  overlay.style.display = 'none';
  await resumeAudio();     // garantiza running
  playBeep(880, 0.18);     // beep de confirmación
  if (!isOn) powerBtn.click(); // enciende
  if (soundOn) startHum();     // hum si sonido ON
};

powerBtn.onclick=()=>{
  isOn=!isOn;
  powerBtn.textContent=isOn?'Apagar':'Encender';
  led.classList.toggle('on', isOn);
  toggleModules(isOn);
  if(!audioCtx) return;
  if(isOn && soundOn) startHum(); else stopHum();
};

// Failsafe 15s: cierra overlay y enciende si quedó trabado
setTimeout(()=>{
  if(overlay.style.display!=='none'){
    overlay.style.display='none';
    if(!isOn) powerBtn.click();
  }
},15000);

// ===== Monitores (gauges) =====
const grid=document.getElementById('grid');
const MODULES=[
  { id:'org-internos', title:'Rejuvenecimiento — Órganos internos', target:95 },
  { id:'org-externos', title:'Rejuvenecimiento — Piel & tejido externo', target:92 },
  { id:'glucosa',      title:'Regulación de azúcar', target:94 },
  { id:'globulos',     title:'Glóbulos (inmunidad)', target:90 },
  { id:'presion',      title:'Presión arterial',     target:88 },
  { id:'detox',        title:'Detox hepático',       target:93 },
  { id:'mental',       title:'Estado mental — Neuroquímica', target:91 },
];

function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function toAngle(v){return -120 + (clamp(v,0,100)*2.4);}
function setStatus(card,text,level){
  const dot=card.querySelector('.dot');
  const st=card.querySelector('.status span');
  if(dot) dot.className='dot '+level;
  if(st)  st.textContent=text;
}
function setVisual(card,v,active){
  const needle=card.querySelector('.needle'), value=card.querySelector('.value');
  card.dataset.current=v;
  if(needle) needle.style.transform=`rotate(${toAngle(v)}deg)`;
  if(value)  value.textContent=`${Math.round(v)}%`;
  if(v<40) setStatus(card, active?'Calibrando':'En espera', 'bad');
  else if(v<75) setStatus(card, active?'Calibrando':'Ajustando', 'warn');
  else setStatus(card, 'Estable', 'good');
}

// ==== Sonido que sigue a la aguja ====
function startGaugeTone(card){
  if(!audioCtx || !soundOn || card._tone) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type='triangle';
  g.gain.value = 0.02; // volumen suave
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
function mapPctToFreq(p){ // 0..100% => 300..1400 Hz
  const pct = Math.max(0, Math.min(100, p||0));
  return 300 + (pct/100)*(1400-300);
}

function animateTo(card,goal){
  clearInterval(card._timer);
  card._timer=setInterval(()=>{
    let cur=Number(card.dataset.current||0);
    cur += (goal-cur)*0.10 + 0.6;

    // Actualiza tono si está activo
    if(card._tone && audioCtx){
      const f = mapPctToFreq(cur);
      try{ card._tone.o.frequency.setTargetAtTime(f, audioCtx.currentTime, 0.05); }catch{}
    }

    if(Math.abs(goal-cur)<0.6){
      cur=goal;
      setVisual(card,cur,true);
      clearInterval(card._timer);
      card._active=false;
      stopGaugeTone(card); // detener tono al llegar al objetivo
    }else{
      setVisual(card,cur,true);
    }
  },100);
}

function createCard(mod){
  const card=document.createElement('section'); card.className='card';

  const title=document.createElement('div'); title.className='title-sm'; title.textContent=mod.title;

  const status=document.createElement('div'); status.className='status';
  const dot=document.createElement('i'); dot.className='dot bad';
  const stText=document.createElement('span'); stText.textContent='En espera';
  status.append(dot,stText);

  const gauge=document.createElement('div'); gauge.className='gauge';
  const dial=document.createElement('div'); dial.className='dial';

  // Valor inicial aleatorio entre 20 y 60
  const init=Math.floor(20+Math.random()*40);

  const needle=document.createElement('div'); needle.className='needle';
  needle.style.transform=`rotate(${toAngle(init)}deg)`;
  const hub=document.createElement('div'); hub.className='hub';
  const value=document.createElement('div'); value.className='value'; value.textContent=init+'%';

  gauge.append(dial, needle, hub, value);

  const controls=document.createElement('div'); controls.className='controls';
  const bStart=document.createElement('button'); bStart.className='btn mod'; bStart.textContent='Activar';
  const bStop=document.createElement('button'); bStop.className='btn alt mod'; bStop.textContent='Detener';
  controls.append(bStart,bStop);

  card.append(title,status,gauge,controls);

  card._timer=null; card._active=false; card.dataset.current=init;
  setVisual(card, init, false);

  const goal=clamp(mod.target??92,70,100);

  function start(){
    if(!isOn||card._active) return;
    card._active=true;
    startGaugeTone(card);     // <<< inicia tono ligado a la aguja
    animateTo(card,goal);
    playBeep();               // beep al activar
  }
  function stop(){
    clearInterval(card._timer); card._active=false;
    stopGaugeTone(card);      // <<< detiene tono al parar
    card._timer=setInterval(()=>{
      let cur=Number(card.dataset.current||10);
      cur -= Math.max(0.8,(cur-10)*0.06);
      if(cur<=10){cur=10;setVisual(card,cur,false);clearInterval(card._timer);}
      else setVisual(card,cur,false);
    },90);
  }
  bStart.addEventListener('click',start);
  bStop .addEventListener('click',stop);
  bStart.disabled=true; bStop.disabled=true;

  return card;
}
MODULES.forEach(m=> grid.appendChild(createCard(m)));

function toggleModules(on){
  document.querySelectorAll('.card').forEach(card=>{
    const btns=card.querySelectorAll('.btn.mod');
    btns.forEach(b=> b.disabled=!on);
    if(!on){
      clearInterval(card._timer);
      stopGaugeTone(card);
      setVisual(card,0,false);
      setStatus(card,'En espera','bad');
      card._active=false;
    }
  });
}

// ===== Chequeos simples =====
const CHECKS=[
  { id:'scan',           label:'Escaneo sistémico' },
  { id:'torrente',       label:'Recuento en torrente sanguíneo' },
  { id:'operativos',     label:'Nanorobots operativos' },
  { id:'autorreparacion',label:'Autorreparación celular' },
  { id:'depuracion',     label:'Depuración de toxinas' },
  { id:'serotonina',     label:'Serotonina (ánimo)' },
  { id:'dopamina',       label:'Dopamina (motivación)' },
  { id:'oxitocina',      label:'Oxitocina (vínculo)' },
  { id:'melatonina',     label:'Melatonina (sueño)' },
  { id:'cortisol',       label:'Cortisol (estrés)' },
];

const checklist=document.getElementById('checklist');
CHECKS.forEach(ch=>{
  const row=document.createElement('div'); row.className='row';
  const head=document.createElement('div'); head.className='row-head';
  const label=document.createElement('div'); label.className='row-label'; label.textContent=ch.label;
  const perc=document.createElement('div'); perc.className='perc'; perc.id=`p-${ch.id}`; perc.textContent='0%';
  head.append(label,perc);
  const bar=document.createElement('div'); bar.className='bar';
  const fill=document.createElement('div'); fill.className='fill'; fill.id=`b-${ch.id}`;
  bar.append(fill); row.append(head,bar);
  checklist.appendChild(row);
});

function setCheck(id,pct){
  pct=Math.max(0,Math.min(100,pct));
  const f=document.getElementById(`b-${id}`);
  const p=document.getElementById(`p-${id}`);
  if(f) f.style.width=pct+'%';
  if(p) p.textContent=Math.round(pct)+'%';
}

// Valores por defecto si el usuario espera en la bienvenida
setTimeout(()=>{
  if(document.getElementById('overlay')?.style.display!=='none'){
    setCheck('scan', 10);
    setCheck('torrente', 20);
    setCheck('operativos', 25);
    setCheck('autorreparacion', 8);
    setCheck('depuracion', 12);
  }
},1500);

// Al iniciar monitoreo, asignamos valores "buenos"
document.getElementById('startBtn').addEventListener('click', ()=>{
  setCheck('scan', 28);
  setCheck('torrente', 84);
  setCheck('operativos', 92);
  setCheck('autorreparacion', 31);
  setCheck('depuracion', 47);
  setCheck('serotonina', 76);
  setCheck('dopamina', 64);
  setCheck('oxitocina', 58);
  setCheck('melatonina', 71);
  setCheck('cortisol', 43);
});
