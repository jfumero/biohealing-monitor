// ===== FX Futurista: Fondo sutil con partículas =====
class BloodstreamFX{
  constructor(id){
    this.canvas=document.getElementById(id);
    this.ctx=this.canvas?.getContext('2d')||null;
    this.dpr=Math.max(1, Math.min(2, window.devicePixelRatio||1));
    this.running=false; this.t=0;
    this.particles=[]; this.cells=[];
    if(this.ctx){ window.addEventListener('resize',()=>this.resize(),{passive:true}); this.resize(); this.initField(); }
  }
  resize(){
    const w=innerWidth,h=innerHeight;
    this.canvas.width=Math.floor(w*this.dpr);
    this.canvas.height=Math.floor(h*this.dpr);
    this.canvas.style.width=w+'px'; this.canvas.style.height=h+'px';
  }
  initField(){
    const W=this.canvas.width,H=this.canvas.height;
    const bots=120, cells=30;
    this.particles=Array.from({length:bots},()=>({
      x:Math.random()*W, y:Math.random()*H, vx:(0.3+Math.random()*0.7)*this.dpr,
      amp:8+Math.random()*14, phase:Math.random()*Math.PI*2, r:0.4+Math.random()*1.0
    }));
    this.cells=Array.from({length:cells},()=>({
      x:Math.random()*W, y:Math.random()*H, vx:(0.15+Math.random()*0.4)*this.dpr,
      amp:6+Math.random()*10, phase:Math.random()*Math.PI*2, r:1.5+Math.random()*1.5
    }));
  }
  start(){ if(!this.ctx||this.running) return; this.running=true; this.t=performance.now(); requestAnimationFrame(t=>this.loop(t)); }
  stop(){ if(!this.ctx) return; this.running=false; this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height); }
  loop(now){
    if(!this.running||!this.ctx) return;
    const {ctx,canvas}=this; const W=canvas.width,H=canvas.height; const dt=(now-this.t)/1000; this.t=now;
    // Fondo
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0b0a12'); g.addColorStop(1,'#110b15');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    // Corrientes
    ctx.lineWidth=8*this.dpr; ctx.strokeStyle='rgba(255,120,160,.08)';
    for(let i=0;i<3;i++){ const baseY=(H/4)*(i+1)+Math.sin(now/900+i)*4*this.dpr; ctx.beginPath(); ctx.moveTo(0,baseY);
      for(let x=0;x<=W;x+=50*this.dpr){ const yy=baseY+Math.sin((x+now/5)/60+i)*2*this.dpr; ctx.lineTo(x,yy); }
      ctx.stroke();
    }
    // Células
    for(const c of this.cells){ ctx.fillStyle='rgba(240,90,126,.7)'; ctx.beginPath(); ctx.arc(c.x,c.y,c.r*this.dpr,0,Math.PI*2); ctx.fill();
      c.x+=c.vx; c.y+=Math.sin((c.x+now/20)/60)*(0.3*this.dpr); if(c.x>W+10){c.x=-10; c.y=Math.random()*H;}
    }
    // Nanobots
    ctx.save(); ctx.globalCompositeOperation='lighter';
    for(const p of this.particles){
      const y=p.y+Math.sin(p.phase+now/600)*p.amp, r=p.r*this.dpr;
      const rg=ctx.createRadialGradient(p.x,y,0,p.x,y,r*5); rg.addColorStop(0,'rgba(90,209,255,.20)'); rg.addColorStop(1,'rgba(90,209,255,0)');
      ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(p.x,y,r*5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#5ad1ff'; ctx.globalAlpha=.7; ctx.beginPath(); ctx.arc(p.x,y,r,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
      p.x+=p.vx*(1+Math.sin(now/1200)*.04); p.phase+=dt; if(p.x>W+10){p.x=-10; p.y=Math.random()*H;}
    }
    ctx.restore();
    requestAnimationFrame(t=>this.loop(t));
  }
}

// ===== Edad (detallada Y-M-D h:m:s) =====
const birth = new Date(1976,11,4,0,50,0); // 4/12/1976 00:50 local
function ageTextDetailed(now=new Date()){
  let y=now.getFullYear()-birth.getFullYear();
  let m=now.getMonth()-birth.getMonth();
  let d=now.getDate()-birth.getDate();
  let H=now.getHours()-birth.getHours();
  let Mi=now.getMinutes()-birth.getMinutes();
  let S=now.getSeconds()-birth.getSeconds();
  if(S<0){S+=60;Mi--;} if(Mi<0){Mi+=60;H--;} if(H<0){H+=24;d--;}
  if(d<0){ const prevDays=new Date(now.getFullYear(), now.getMonth(), 0).getDate(); d+=prevDays; m--; }
  if(m<0){ m+=12; y--; }
  return `${y}a ${m}m ${d}d ${H}h ${Mi}m ${S}s`;
}
function renderAge(){
  const txt=ageTextDetailed();
  const ageEl=document.getElementById('age'); if(ageEl) ageEl.textContent=txt;
  const meta=document.getElementById('project-meta'); if(meta) meta.innerHTML=`Paciente: <b>Jonathan Fumero Mesa</b> · Edad: ${txt}`;
}
setInterval(renderAge,1000); renderAge();

// ===== Audio (hum + beep suave) =====
let audioCtx=null, masterGain=null, humOsc=null, humGain=null; let soundOn=true;
function ensureAudio(){
  if(audioCtx) return;
  audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  masterGain=audioCtx.createGain(); masterGain.gain.value=0.0009; masterGain.connect(audioCtx.destination);
}
function playBeep(){
  if(!audioCtx||!soundOn) return;
  const o=audioCtx.createOscillator(), g=audioCtx.createGain();
  o.type='sine'; o.frequency.value=880; g.gain.value=0.001; o.connect(g).connect(masterGain);
  o.start(); g.gain.exponentialRampToValueAtTime(0.00001,audioCtx.currentTime+0.12); o.stop(audioCtx.currentTime+0.14);
}
function startHum(){
  if(!audioCtx||humOsc||!soundOn) return;
  humOsc=audioCtx.createOscillator(); humGain=audioCtx.createGain();
  humOsc.type='sawtooth'; humOsc.frequency.value=110; humGain.gain.value=0.0005;
  humOsc.connect(humGain).connect(masterGain); humOsc.start();
}
function stopHum(){
  if(!humOsc) return;
  humGain.gain.exponentialRampToValueAtTime(0.00001,audioCtx.currentTime+0.2);
  humOsc.stop(audioCtx.currentTime+0.25); humOsc=null; humGain=null;
}

// ===== Música MP3 (Web Audio) =====
// Cambiá el nombre si tu archivo se llama distinto:
const MUSIC_URL = 'music.mp3';

let musicBuffer = null;   // se carga una vez
let musicSource = null;   // instancia en reproducción
let musicGain = null;     // volumen de la música
let musicOn = true;       // (opcional) podés poner false si querés que arranque apagada

async function loadMusicOnce(){
  try{
    ensureAudio();
    if(musicBuffer) return; // ya cargada
    const res = await fetch(MUSIC_URL);
    if(!res.ok) throw new Error('No se pudo cargar el MP3');
    const ab = await res.arrayBuffer();
    musicBuffer = await audioCtx.decodeAudioData(ab);
  }catch(err){
    console.warn('Error cargando música:', err);
  }
}

function startMusic(){
  if(!audioCtx || !soundOn || !musicOn || !musicBuffer) return;
  // Evita dos reproducciones simultáneas
  stopMusic();

  // Fuente en loop
  musicSource = audioCtx.createBufferSource();
  musicSource.buffer = musicBuffer;
  musicSource.loop = true;

  // Gain propio de música (independiente del master)
  if(!musicGain){
    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.12; // Volumen (0.0–1.0)
    musicGain.connect(audioCtx.destination);
  }

  musicSource.connect(musicGain);
  musicSource.start(0);
}

function stopMusic(){
  try{
    if(musicSource){
      musicSource.stop(0);
      musicSource.disconnect();
    }
  }catch{}
  musicSource = null;
}

// ===== Zodiacos / Luna / Circadiano =====
const CHINESE=['Rata','Buey','Tigre','Conejo','Dragón','Serpiente','Caballo','Cabra','Mono','Gallo','Perro','Cerdo'];
function chineseAnimal(y){ return CHINESE[(y-1900)%12]; }
function chineseElement(y){
  const e=(y-4)%10; // 0-1 Madera, 2-3 Fuego, 4-5 Tierra, 6-7 Metal, 8-9 Agua
  if(e===0||e===1) return 'Madera';
  if(e===2||e===3) return 'Fuego';
  if(e===4||e===5) return 'Tierra';
  if(e===6||e===7) return 'Metal';
  return 'Agua';
}
function zodiac(d){
  const m=d.getMonth()+1, day=d.getDate();
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
  return'Piscis ♓';
}
function moon(d){
  const syn=29.530588853, ref=new Date(Date.UTC(2000,0,6,18,14));
  const days=(d-ref)/86400000, age=((days%syn)+syn)%syn;
  if(age<1.84566)return'Creciente nueva 🌑'.replace('Creciente nueva','Luna nueva');
  if(age<5.53699)return'Creciente visible 🌒';
  if(age<9.22831)return'Cuarto creciente 🌓';
  if(age<12.91963)return'Gibosa creciente 🌔';
  if(age<16.61096)return'Luna llena 🌕';
  if(age<20.30228)return'Gibosa menguante 🌖';
  if(age<23.99361)return'Cuarto menguante 🌓'.replace('🌓','🌗');
  return'Creciente menguante 🌘';
}
function circadian(d){
  const h=d.getHours()+d.getMinutes()/60;
  if(h>=22||h<6) return'Sueño / recuperación';
  if(h<9) return'Activación matinal';
  if(h<12) return'Alerta alta';
  if(h<14) return'Bajada posalmuerzo';
  if(h<18) return'Segundo pico de energía';
  return'Desaceleración vespertina';
}
// Biorritmo compacto con color
function bioCompact(days, period){
  const pct=Math.round(Math.sin(2*Math.PI*days/period)*100);
  const cls=pct>3?'bio-pos':(pct<-3?'bio-neg':'bio-neu');
  const sign=pct>0?'+':'';
  return {html:`<span class="bio-val ${cls}">${sign}${pct}%</span>`, pct};
}
function renderHeaderInfo(now=new Date()){
  const zOcc = zodiac(new Date(1976,11,4));
  const animal = chineseAnimal(1976), elem = chineseElement(1976); // 1976 => Dragón(Fuego)
  const czTxt = `${animal} (${elem}) ${animal==='Dragón'?'🐉':''}`;

  const set=(id,txt)=>{ const el=document.getElementById(id); if(el) el.innerHTML=txt; };
  set('hd-zodiac', zOcc);
  set('hd-czodiac', czTxt);
  set('hd-moon',   moon(now));
  set('hd-circ',   circadian(now));

  const birthRef = new Date(birth.getFullYear(),birth.getMonth(),birth.getDate());
  const days = Math.floor((new Date(now.getFullYear(),now.getMonth(),now.getDate()) - birthRef)/86400000);
  const f=bioCompact(days,23), e=bioCompact(days,28), i=bioCompact(days,33);
  set('hd-bio-f', `${f.html} 💪`);
  set('hd-bio-e', `${e.html} 💖`);
  set('hd-bio-i', `${i.html} 🧠`);
}
setInterval(()=>renderHeaderInfo(new Date()),1000); renderHeaderInfo(new Date());

// ===== Bienvenida: contadores & barras =====
function animateCounter(el,to,ms=3200){
  if(!el) return;
  const start=0, t0=performance.now();
  function step(t){
    const k=Math.min(1,(t-t0)/ms), ease=0.5-0.5*Math.cos(Math.PI*k);
    el.textContent=Math.round(start+(to-start)*ease).toLocaleString('es-UY');
    if(k<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function initWelcome(){
  const base=12_000_000;
  const ops=Math.floor(base*(0.90+Math.random()*0.06)); // 90–96%
  animateCounter(document.getElementById('n-total'), base, 3000);
  animateCounter(document.getElementById('n-op'), ops, 3200);
  const totalBar=document.getElementById('swarm-total-bar');
  const opBar=document.getElementById('swarm-bar');
  if(totalBar) totalBar.style.width='100%';
  setTimeout(()=>{ if(opBar) opBar.style.width=Math.round(ops/base*100)+'%'; }, 600);
}
initWelcome();

// ===== Módulos / Gauges =====
const MODULES=[
  { id:'org-internos', title:'Rejuvenecimiento — Órganos internos', target:95 },
  { id:'org-externos', title:'Rejuvenecimiento — Piel & tejido externo', target:92 },
  { id:'glucosa',      title:'Regulación de azúcar', target:94 },
  { id:'globulos',     title:'Glóbulos (inmunidad)', target:90 },
  { id:'presion',      title:'Presión arterial', target:88 },
  { id:'detox',        title:'Detox hepático', target:93 },
];
const grid=document.getElementById('grid');
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function toAngle(v){return -120 + clamp(v,0,100)*2.4;}

// (1) Interpretaciones por módulo (helper)
function interpText(modId, v){
  // v es 0..100 (aprox)
  const pct = Math.round(v);
  const low = pct < 40, mid = pct >= 40 && pct < 75, high = pct >= 75;
  const ok  = pct >= 85;

  switch(modId){
    case 'glucosa':
      if(low)  return 'Glucemia baja/irregular: revisar ingesta y ritmo.';
      if(mid)  return 'Glucemia modulándose; evitar picos azucarados.';
      return ok ? 'Glucemia estable y en rango óptimo.' : 'Glucemia estable.';
    case 'presion':
      if(low)  return 'Presión inestable o baja; hidratarse y descansar.';
      if(mid)  return 'Presión ajustándose; monitoreo recomendado.';
      return ok ? 'Presión arterial estable y óptima.' : 'Presión estable.';
    case 'globulos':
      if(low)  return 'Respuesta inmune reducida; priorizar descanso.';
      if(mid)  return 'Sistema inmune activándose.';
      return ok ? 'Inmunidad fuerte y equilibrada.' : 'Inmunidad estable.';
    case 'detox':
      if(low)  return 'Detox lento; favorecer hidratación.';
      if(mid)  return 'Depuración en marcha.';
      return ok ? 'Detox hepático alto — buen clearance.' : 'Depuración estable.';
    case 'org-internos':
      if(low)  return 'Órganos internos en calibración.';
      if(mid)  return 'Rejuvenecimiento avanzando.';
      return ok ? 'Órganos internos rejuvenecidos/estables.' : 'Buen estado interno.';
    case 'org-externos':
      if(low)  return 'Tejido/piel en ajuste inicial.';
      if(mid)  return 'Regeneración cutánea en progreso.';
      return ok ? 'Piel y tejidos externos en óptimo estado.' : 'Tejido externo estable.';
    default:
      if(low)  return 'En calibración.';
      if(mid)  return 'Ajustando.';
      return 'Estable.';
  }
}

function setStatus(card,text,level){
  const dot=card.querySelector('.dot'), st=card.querySelector('.status span');
  if(dot) dot.className='dot '+level; if(st) st.textContent=text;
}
function setVisual(card,v,active){
  const needle=card.querySelector('.needle'), value=card.querySelector('.value');
  card.dataset.current=v;
  if(needle) needle.style.transform=`rotate(${toAngle(v)}deg)`;
  if(value) value.textContent=`${Math.round(v)}%`;
  if(v<40) setStatus(card, active?'Calibrando':'En espera', 'bad');
  else if(v<75) setStatus(card, active?'Calibrando':'Ajustando', 'warn');
  else setStatus(card, 'Estable', 'good');

  // (2) Interpretación
  const modId = card.dataset.modid || '';
  const interpEl = card.querySelector('.interp');
  if(interpEl) interpEl.textContent = interpText(modId, v);
}
function animateTo(card,goal){
  clearInterval(card._timer);
  card._timer=setInterval(()=>{
    let cur=Number(card.dataset.current||0);
    cur += (goal-cur)*0.10 + 0.6;
    if(Math.abs(goal-cur)<0.6){cur=goal; setVisual(card,cur,true); clearInterval(card._timer); card._active=false;}
    else setVisual(card,cur,true);
  },100);
}
function createCard(mod){
  const card=document.createElement('section'); card.className='card';
  const title=document.createElement('div'); title.className='title-sm'; title.textContent=mod.title;
  const status=document.createElement('div'); status.className='status';
  const dot=document.createElement('i'); dot.className='dot bad';
  const st=document.createElement('span'); st.textContent='En espera'; status.append(dot,st);

  const gauge=document.createElement('div'); gauge.className='gauge';
  const dial=document.createElement('div'); dial.className='dial';
  const needle=document.createElement('div'); needle.className='needle';
  needle.style.transform=`rotate(${toAngle(0)}deg)`;
  const hub=document.createElement('div'); hub.className='hub';
  const value=document.createElement('div'); value.className='value'; value.textContent='0%';
  gauge.append(dial,needle,hub,value);

  const ctrls=document.createElement('div'); ctrls.className='controls';
  const bStart=document.createElement('button'); bStart.className='btn mod'; bStart.textContent='Activar';
  const bStop=document.createElement('button'); bStop.className='btn alt mod'; bStop.textContent='Detener';
  ctrls.append(bStart,bStop);

  card.append(title,status,gauge,ctrls);

  // (2) Texto interpretativo
  const interp = document.createElement('p'); 
  interp.className = 'interp';
  interp.textContent = '—';
  card.append(interp);

  // (2) Guarda el id del módulo para el helper
  card.dataset.modid = mod.id;

  card._timer=null; card._active=false; card.dataset.current=0;
  const goal=clamp(mod.target??92,70,100);

  function start(){
    if(!isOn||card._active) return;
    card._active=true; animateTo(card,goal); playBeep(); gauge.classList.add('neon');
  }
  function stop(){
    gauge.classList.remove('neon');
    clearInterval(card._timer); card._active=false;
    card._timer=setInterval(()=>{
      let cur=Number(card.dataset.current||10);
      cur -= Math.max(0.8,(cur-10)*0.06);
      if(cur<=10){cur=10; setVisual(card,cur,false); clearInterval(card._timer);}
      else setVisual(card,cur,false);
    },90);
  }
  bStart.addEventListener('click',start);
  bStop.addEventListener('click',stop);
  bStart.disabled=true; bStop.disabled=true;
  return card;
}
MODULES.forEach(m=>grid.appendChild(createCard(m)));
function toggleModules(on){
  document.querySelectorAll('.card').forEach(card=>{
    const btns=card.querySelectorAll('.btn.mod');
    btns.forEach(b=> b.disabled=!on);
    if(!on){
      clearInterval(card._timer); setVisual(card,0,false); setStatus(card,'En espera','bad');
      card._active=false; card.querySelector('.gauge')?.classList.remove('neon');
    }
  });
}

// ===== Ticker de sistema (una sola línea) =====
const CHECKS=[
  { id:'scan', label:'Escaneo sistémico' },
  { id:'torrente', label:'Recuento en torrente sanguíneo' },
  { id:'operativos', label:'Nanorobots operativos' },
  { id:'autorreparacion', label:'Autorreparación celular' },
  { id:'depuracion', label:'Depuración de toxinas' },
];
const CHECK_STATE={};
function renderSysTicker(){
  const track=document.getElementById('sys-ticker-track'); if(!track) return;
  const parts=CHECKS.map(ch=>{
    const pct=Math.round(CHECK_STATE[ch.id] ?? 0);
    const cls = pct>70?'nb-pos':(pct>40?'nb-warn':'nb-neg');
    return `<span class="nb-item"><span>${ch.label}:</span> <strong class="${cls}">${pct}%</strong></span>`;
  });
  track.innerHTML = parts.join('<span class="nb-sep">•</span>') + '<span class="nb-sep">•</span>' + parts.join('<span class="nb-sep">•</span>');
}
function setCheck(id, pct){
  CHECK_STATE[id]=Math.max(0,Math.min(100,pct));
  renderSysTicker();
}
setTimeout(()=>{
  const overlay=document.getElementById('overlay');
  if(overlay && !overlay.classList.contains('is-hidden')){
    setCheck('scan',10); setCheck('torrente',20); setCheck('operativos',25); setCheck('autorreparacion',8); setCheck('depuracion',12);
  } else {
    renderSysTicker();
  }
},1200);

// ===== Helpers de animación (para barras del Optimizer) =====
function animateValue(from, to, duration, onUpdate){
  return new Promise(resolve=>{
    const t0=performance.now();
    function step(t){
      const k=Math.min(1,(t-t0)/duration);
      const e = 1 - Math.pow(1-k,3); // easeOutCubic
      const v = from + (to-from)*e;
      onUpdate(v);
      if(k<1) requestAnimationFrame(step); else resolve();
    }
    requestAnimationFrame(step);
  });
}
function animateFill(el, fromPct, toPct, duration, onProgress){
  return animateValue(fromPct, toPct, duration, v=>{
    el.style.transform = `scaleX(${v/100})`;
    onProgress?.(v);
  });
}
// Color HSL dinámico rojo(0) → verde(120) según %
function colorForPct(pct){
  const p = Math.max(0, Math.min(100, pct));
  const h = Math.round(p*1.2); // 0..120
  return `linear-gradient(90deg, hsl(${h} 90% 50%), hsl(${h} 90% 50%))`;
}

// ===== Optimización (cola) =====
const OPT_QUEUE = [
  // 1 Entradas básicas
  'Agua','Oxígeno','Carbohidratos','Grasas saludables','Proteínas',
  'Minerales','Vitaminas',
  // 2 Regulación (NT + Hormonas)
  'Dopamina','Serotonina','GABA','Glutamato','Acetilcolina',
  'Insulina','Glucagón','T3/T4','GH','Cortisol','Melatonina','Testosterona','Estrógeno','Progesterona','Leptina','Grelina',
  // 3 Soporte
  'Sistema Inmune','Microbiota intestinal','Sodio','Potasio','Calcio','Músculos','Huesos','Tejido conectivo',
  // 4 Estilo de vida
  'Movimiento físico','Sueño','Gestión emocional','Conexión social',
  // 5 Hábitos/ambiente
  'Alimentación','Hidratación','Exposición solar','Aire limpio','Higiene/Prevención',
  // 6 Núcleo celular
  'ADN','Reparación celular','Células madre','Telómeros','Autofagia'
];
const optPanel=document.getElementById('optimizer');
const optList=document.getElementById('opt-list');
const optBtn=document.getElementById('opt-btn');
const optStartBtn=document.getElementById('opt-start-btn');
const optCancel=document.getElementById('opt-cancel');
// Barra de progreso general
const optProgress = document.querySelector('.opt-progress');
const optProgressFill = document.getElementById('opt-progress-fill');
const optProgressLabel = document.getElementById('opt-progress-label');

let optRunning=false, optAbort=null;
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

function createOptItem(name,from){
  const row=document.createElement('div'); row.className='opt-row';
  row.innerHTML=`
    <span>${name}</span>
    <div class="opt-meter">
      <div class="opt-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(from)}">
        <div class="opt-fill" style="transform:scaleX(${from/100}); background:${colorForPct(from)}"></div>
        <div class="opt-mini-label">${Math.round(from)}%</div>
      </div>
    </div>`;
  return row;
}

async function runOptimizer(){
  if(optRunning) return;
  optRunning=true; optAbort=new AbortController();
  optList.innerHTML=''; optPanel.classList.remove('hidden'); if(optBtn) optBtn.disabled=true;

  // Inicial del progreso general
  if(optProgressFill){
    optProgressFill.style.width = '0%';
    optProgressFill.style.background = colorForPct(0);
  }
  if(optProgressLabel) optProgressLabel.textContent = '0%';

  const total = OPT_QUEUE.length;
  let processed = 0;

  for(const name of OPT_QUEUE){
    if(optAbort.signal.aborted) break;

    const from=Math.max(10,Math.round(30+Math.random()*25)); // 30–55%
    const row=createOptItem(name,from);
    const bar=row.querySelector('.opt-bar');
    const fill=row.querySelector('.opt-fill');
    const miniLabel=row.querySelector('.opt-mini-label');
    optList.prepend(row);

    // Animar ítem hasta 100%, actualizando color y % (centrado dentro de la barrita)
    await animateFill(fill, from, 100, 850, v=>{
      const pct = Math.round(v);
      if(miniLabel) miniLabel.textContent = pct + '%';
      if(bar) bar.setAttribute('aria-valuenow', String(pct));
      fill.style.background = colorForPct(v);
    });

    // Eco visual al ticker (aleatorio)
    const keys=['scan','torrente','operativos','autorreparacion','depuracion'];
    const k=keys[Math.floor(Math.random()*keys.length)];
    setCheck(k, Math.round(60 + Math.random()*40));

    // Actualizar progreso general (barra + etiqueta + color)
    processed++;
    const gpct = Math.round((processed/total)*100);
    if(optProgressFill){
      optProgressFill.style.width = gpct + '%';
      optProgressFill.style.background = colorForPct(gpct);
    }
    if(optProgressLabel) optProgressLabel.textContent = gpct + '%';

    // Pausa breve y quitar el ítem
    await sleep(300);
    row.remove();
  }

  // Glow/flash suave al completar (300ms)
  if(optProgress && optProgressLabel && optProgressLabel.textContent === '100%'){
    const prev = optProgress.style.boxShadow;
    optProgress.style.boxShadow = '0 0 18px rgba(46,234,138,.9), 0 0 36px rgba(46,234,138,.55)';
    setTimeout(()=>{ optProgress.style.boxShadow = prev || ''; }, 320);
  }

  optPanel.classList.add('hidden');
  optRunning=false; if(optBtn) optBtn.disabled=false;
}

optBtn?.addEventListener('click',()=>{ playBeep(); runOptimizer(); });
optStartBtn?.addEventListener('click',()=>{
  overlay.classList.add('is-hidden');
  ensureAudio(); try{ audioCtx && audioCtx.resume(); }catch{}
  if(!isOn) powerBtn.click();
  if(soundOn) startHum();
  // Precargar música (no reproduce hasta ON+soundOn)
  loadMusicOnce();
  fx.start();
});
optCancel?.addEventListener('click',()=>{
  if(!optRunning){ optPanel.classList.add('hidden'); return; }
  optAbort.abort();
});

// ===== Power + Overlay + FX =====
const overlay=document.getElementById('overlay');
const startBtn=document.getElementById('startBtn');
const powerBtn=document.getElementById('power-btn');
const led=document.getElementById('led');
const soundBtn=document.getElementById('sound-btn');
const fx=new BloodstreamFX('fx-bloodstream');
let isOn=false;

startBtn.onclick=async()=>{
  overlay.classList.add('is-hidden');
  ensureAudio(); try{ await audioCtx.resume(); }catch{}
  if(!isOn) powerBtn.click();
  if(soundOn) startHum();
  // Precargar música para que arranque rápido cuando corresponde
  loadMusicOnce();
  fx.start();
};
powerBtn.onclick=()=>{
  isOn=!isOn;
  powerBtn.textContent=isOn?'Apagar':'Encender';
  led.classList.toggle('on',isOn);
  toggleModules(isOn);
  if(!audioCtx) return;

  if(isOn && soundOn){
    startHum();
    // Cargar si falta y reproducir música
    loadMusicOnce().then(()=> startMusic());
  } else {
    stopHum();
    stopMusic();
  }

  if(isOn){ fx.start(); renderHeaderInfo(new Date()); } else { fx.stop(); }
};
soundBtn.onclick=async()=>{
  ensureAudio(); try{ await audioCtx.resume(); }catch{}
  soundOn=!soundOn;
  soundBtn.textContent='Sonido: '+(soundOn?'ON':'OFF');
  soundBtn.setAttribute('aria-pressed', String(soundOn));

  if(isOn && soundOn){
    startHum();
    loadMusicOnce().then(()=> startMusic());
  } else {
    stopHum();
    stopMusic();
  }
};
// Failsafe: oculta overlay a los 15s
setTimeout(()=>{ if(!overlay.classList.contains('is-hidden')){ overlay.classList.add('is-hidden'); if(!isOn) powerBtn.click(); } },15000);

// Pausa FX (y música) si pestaña oculta
document.addEventListener('visibilitychange', ()=>{
  if(document.hidden){
    fx.stop();
    stopMusic();
  } else {
    if(isOn){
      fx.start();
      if(soundOn) loadMusicOnce().then(()=> startMusic());
    }
  }
});

// (3) Botón “Ayuda” abre/cierra la leyenda
const helpBtn = document.getElementById('help-btn');
const legendPanel = document.getElementById('legend');
const legendClose = document.getElementById('legend-close');
helpBtn?.addEventListener('click', ()=> legendPanel?.classList.toggle('hidden'));
legendClose?.addEventListener('click', ()=> legendPanel?.classList.add('hidden'));
