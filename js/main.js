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

// Ambiente retro (hum + blips aleatorios)
let ambOn = false;
let blipTimer = null;

function startAmbient(){
  if(!audioCtx || !soundOn || ambOn) return;
  ambOn = true;
  startHum(); // hum base

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
  if(blipTimer){ clearTimeout(blipTimer); blipTimer = null; }
  stopHum();
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

// ==== tono ascendente para el recuento ====
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

function initWelcome(){
  const base=12_000_000, ops=Math.floor(base*(0.90+Math.random()*0.06));
  const elT=document.getElementById('n-total'), elO=document.getElementById('n-op'), bar=document.getElementById('swarm-bar');

  playAscending(3400); // acompaña los contadores

  if(elT) animateCounter(elT,base,3200);
  if(elO) animateCounter(elO,ops,3400);
  if(bar) setTimeout(()=>{ bar.style.width=Math.round(ops/base*100)+'%'; },700);
}
initWelcome();

// ===== Power & overlay =====
const overlay=document.getElementById('overlay');
const startBtn=document.getElementById('startBtn');
const powerBtn=document.getElementById('power-btn');
const led=document.getElementById('led');
const soundBtn=document.getElementById('sound-btn');
const ambBtn=document.getElementById('amb-btn');

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

if (ambBtn){
  ambBtn.addEventListener('click', async ()=>{
    await resumeAudio();
    const next = ambBtn.getAttribute('aria-pressed') !== 'true';
    ambBtn.setAttribute('aria-pressed', String(next));
    ambBtn.textContent = 'Ambiente: ' + (next?'ON':'OFF');
    if(next){ startAmbient(); } else { stopAmbient(); }
  });
}

startBtn.onclick = async () => {
  overlay.style.display = 'none';
  await resumeAudio();
  playBeep(880, 0.18);
  if (!isOn) powerBtn.click();
  if (soundOn) startHum();
};

powerBtn.onclick=()=>{
  isOn=!isOn;
  powerBtn.textContent=isOn?'Apagar':'Encender';
  led.classList.toggle('on', isOn);
  toggleModules(isOn);

  if(!audioCtx) return;
  if(isOn && soundOn){
    if(ambBtn?.getAttribute('aria-pressed') === 'true') startAmbient();
    else startHum();
  }else{
    stopAmbient();
  }
};

// ... [resto del archivo: MODULES, createCard, animateTo, checklist, etc.]
// ==== tono ligado al gauge ====
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
