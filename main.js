/* ========= Config paciente ========= */
const PATIENT_NAME = 'Jonathan Fumero Mesa';
const BIRTH = { y:1976, m:12, d:4, hh:0, mm:50, place:'Montevideo, UY' }; // m=1..12

/* ========= Utils DOM ========= */
const $id = (...ids) => ids.map(i=> i && document.getElementById(i)).find(Boolean);
const $q  = (sel) => document.querySelector(sel);
function pad(n){ return String(n).padStart(2,'0'); }

/* ========= Edad viva + cabecera ========= */
const birthDate = new Date(BIRTH.y, BIRTH.m-1, BIRTH.d, BIRTH.hh, BIRTH.mm, 0);
function ageTextDetailed(now=new Date()){
  let y=now.getFullYear()-birthDate.getFullYear();
  let m=now.getMonth()-birthDate.getMonth();
  let d=now.getDate()-birthDate.getDate();
  let H=now.getHours()-birthDate.getHours();
  let Mi=now.getMinutes()-birthDate.getMinutes();
  let S=now.getSeconds()-birthDate.getSeconds();
  if(S<0){S+=60;Mi--;} if(Mi<0){Mi+=60;H--;} if(H<0){H+=24;d--;}
  if(d<0){ const prevDays=new Date(now.getFullYear(), now.getMonth(), 0).getDate(); d+=prevDays; m--; }
  if(m<0){ m+=12; y--; }
  return `${y}a ${m}m ${d}d ${H}h ${Mi}m ${S}s`;
}
function renderAge(){
  const txt=ageTextDetailed();
  $id('patient-name') && ($id('patient-name').textContent = PATIENT_NAME);
  $id('birth-dt') && ($id('birth-dt').textContent = `${pad(BIRTH.d)}/${pad(BIRTH.m)}/${BIRTH.y} ${pad(BIRTH.hh)}:${pad(BIRTH.mm)}h`);
  $id('birth-place') && ($id('birth-place').textContent = BIRTH.place);
  $id('hud-age') && ($id('hud-age').textContent = txt);
  const meta=$id('project-meta');
  if(meta) meta.innerHTML = `Paciente: <b>${PATIENT_NAME}</b> · Nac.: ${pad(BIRTH.d)}/${pad(BIRTH.m)}/${BIRTH.y} ${pad(BIRTH.hh)}:${pad(BIRTH.mm)}h (${BIRTH.place}) · Edad: ${txt}`;
}

/* ========= HUD (zodiaco/luna/circadiano/biorritmos) ========= */
const CHINESE=['Rata','Buey','Tigre','Conejo','Dragón','Serpiente','Caballo','Cabra','Mono','Gallo','Perro','Cerdo'];
function chineseAnimal(y){ return CHINESE[(y-1900)%12]; }
function chineseElement(y){ const e=(y-4)%10; return ['Madera','Madera','Fuego','Fuego','Tierra','Tierra','Metal','Metal','Agua','Agua'][e]; }
function zodiac(d){ const m=d.getMonth()+1, day=d.getDate();
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
  if(age<1.84566)return'Luna nueva 🌑';
  if(age<5.53699)return'Creciente visible 🌒';
  if(age<9.22831)return'Cuarto creciente 🌓';
  if(age<12.91963)return'Gibosa creciente 🌔';
  if(age<16.61096)return'Luna llena 🌕';
  if(age<20.30228)return'Gibosa menguante 🌖';
  if(age<23.99361)return'Cuarto menguante 🌗';
  return'Creciente menguante 🌘';
}
function circadian(d){ const h=d.getHours()+d.getMinutes()/60;
  if(h>=22||h<6) return'Sueño / recuperación';
  if(h<9) return'Activación matinal';
  if(h<12) return'Alerta alta';
  if(h<14) return'Bajada posalmuerzo';
  if(h<18) return'Segundo pico de energía';
  return'Desaceleración vespertina';
}
function bioCompact(days, period){
  const pct=Math.round(Math.sin(2*Math.PI*days/period)*100);
  const cls=pct>3?'bio-pos':(pct<-3?'bio-neg':'bio-neu');
  const sign=pct>0?'+':'';
  return {html:`<span class="bio-val ${cls}">${sign}${pct}%</span>`};
}
function renderHeaderInfo(now=new Date()){
  const set=(id,txt)=>{ const el=$id(id); if(el) el.innerHTML=txt; };
  set('hd-zodiac', zodiac(new Date(BIRTH.y, BIRTH.m-1, BIRTH.d)));
  const animal = chineseAnimal(BIRTH.y), elem = chineseElement(BIRTH.y);
  set('hd-czodiac', `${animal} (${elem}) ${animal==='Dragón'?'🐉':''}`);
  set('hd-moon', moon(now));
  set('hd-circ', circadian(now));
  const birthRef = new Date(BIRTH.y, BIRTH.m-1, BIRTH.d);
  const days = Math.floor((new Date(now.getFullYear(),now.getMonth(),now.getDate()) - birthRef)/86400000);
  const f=bioCompact(days,23), e=bioCompact(days,28), i=bioCompact(days,33);
  set('hd-bio-f', `${f.html} 💪`); set('hd-bio-e', `${e.html} 💖`); set('hd-bio-i', `${i.html} 🧠`);
}

/* ========= Recuento inicial (overlay) ========= */
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
  const elTotal = $id('nb-total');
  const elOp    = $id('nb-active');
  const totalBar = $id('swarm-total-bar');
  const opBar    = $id('swarm-bar');

  const base=12_000_000;
  const ops=Math.floor(base*(0.90+Math.random()*0.06)); // 90–96%

  animateCounter(elTotal, base, 3000);
  animateCounter(elOp, ops, 3200);

  if(totalBar) totalBar.style.width='100%';
  if(opBar) setTimeout(()=>{ opBar.style.width=Math.round(ops/base*100)+'%'; }, 600);
}

/* ========= Ticker ========= */
const CHECKS=[
  { id:'scan', label:'Escaneo sistémico' },
  { id:'torrente', label:'Recuento en torrente sanguíneo' },
  { id:'operativos', label:'Nanorobots operativos' },
  { id:'autorreparacion', label:'Autorreparación celular' },
  { id:'depuracion', label:'Depuración de toxinas' },
];
const CHECK_STATE={};
function renderSysTicker(){
  const track=$id('sys-ticker-track'); if(!track) return;
  const parts=CHECKS.map(ch=>{
    const pct=Math.round(CHECK_STATE[ch.id] ?? 0);
    const cls = pct>70?'nb-pos':(pct>40?'nb-warn':'nb-neg');
    return `<span class="nb-item"><span>${ch.label}:</span> <strong class="${cls}">${pct}%</strong></span>`;
  });
  track.innerHTML = parts.join('<span class="nb-sep">•</span>') + '<span class="nb-sep">•</span>' + parts.join('<span class="nb-sep">•</span>');
}
function setCheck(id, pct){ CHECK_STATE[id]=Math.max(0,Math.min(100,pct)); renderSysTicker(); }

/* ========= Gauges ========= */
const MODULES=[
  { id:'org-internos', title:'Rejuvenecimiento — Órganos internos', target:95 },
  { id:'org-externos', title:'Rejuvenecimiento — Piel & tejido externo', target:92 },
  { id:'glucosa',      title:'Regulación de azúcar', target:94 },
  { id:'globulos',     title:'Glóbulos (inmunidad)', target:90 },
  { id:'presion',      title:'Presión arterial', target:88 },
  { id:'detox',        title:'Detox hepático', target:93 },
];
const gridEl = $id('grid');
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function toAngle(v){return -120 + clamp(v,0,100)*2.4;}
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
  const needle=document.createElement('div'); needle.className='needle'; needle.style.transform=`rotate(${toAngle(0)}deg)`;
  const hub=document.createElement('div'); hub.className='hub';
  const value=document.createElement('div'); value.className='value'; value.textContent='0%';
  gauge.append(dial,needle,hub,value);

  const ctrls=document.createElement('div'); ctrls.className='controls';
  const bStart=document.createElement('button'); bStart.className='btn mod'; bStart.textContent='Activar';
  const bStop=document.createElement('button'); bStop.className='btn alt mod'; bStop.textContent='Detener';
  ctrls.append(bStart,bStop);

  card.append(title,status,gauge,ctrls);
  card._timer=null; card._active=false; card.dataset.current=0;
  const goal=clamp(mod.target??92,70,100);

  function start(){ if(!isOn||card._active) return;
    card._active=true; animateTo(card,goal); gauge.classList.add('neon');
  }
  function stop(){ gauge.classList.remove('neon'); clearInterval(card._timer); card._active=false;
    card._timer=setInterval(()=>{
      let cur=Number(card.dataset.current||10);
      cur -= Math.max(0.8,(cur-10)*0.06);
      if(cur<=10){cur=10; setVisual(card,cur,false); clearInterval(card._timer);}
      else setVisual(card,cur,false);
    },90);
  }
  bStart.addEventListener('click',start);
  bStop.addEventListener('click',stop);
  // se habilitan/inhabilitan con toggleModules()
  return card;
}
function buildGrid(){
  if(!gridEl) return;
  gridEl.innerHTML=''; // evita duplicados
  MODULES.forEach(m=> gridEl.appendChild(createCard(m)));
}
function toggleModules(on){
  document.querySelectorAll('.card').forEach(card=>{
    const btns=card.querySelectorAll('.btn.mod');
    btns.forEach(b=> b.disabled=!on);
    if(!on){ clearInterval(card._timer); setVisual(card,0,false); setStatus(card,'En espera','bad'); card._active=false; card.querySelector('.gauge')?.classList.remove('neon'); }
  });
}

/* ========= Optimizer ========= */
const OPT_QUEUE = [
  'Agua','Oxígeno','Carbohidratos','Grasas saludables','Proteínas',
  'Minerales','Vitaminas',
  'Dopamina','Serotonina','GABA','Glutamato','Acetilcolina',
  'Insulina','Glucagón','T3/T4','GH','Cortisol','Melatonina','Testosterona','Estrógeno','Progesterona','Leptina','Grelina',
  'Sistema Inmune','Microbiota intestinal','Sodio','Potasio','Calcio','Músculos','Huesos','Tejido conectivo',
  'Movimiento físico','Sueño','Gestión emocional','Conexión social',
  'Alimentación','Hidratación','Exposición solar','Aire limpio','Higiene/Prevención',
  'ADN','Reparación celular','Células madre','Telómeros','Autofagia'
];
const optPanel=$id('optimizer'); const optList=$id('opt-list');
const optBtn=$id('btn-optimize'); const optCancel=$id('opt-cancel');
const optProgress=$q('.opt-progress'); const optProgressFill=$id('opt-progress-fill'); const optProgressLabel=$id('opt-progress-label');
let optRunning=false, optAbort=null;
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function animateValue(from,to,dur,onUpdate){ return new Promise(res=>{ const t0=performance.now(); function step(t){ const k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3), v=from+(to-from)*e; onUpdate(v); if(k<1)requestAnimationFrame(step); else res(); } requestAnimationFrame(step); }); }
function animateFill(el,fromPct,toPct,dur,onProg){ return animateValue(fromPct,toPct,dur,v=>{ el.style.transform=`scaleX(${v/100})`; onProg?.(v); }); }
function colorForPct(p){ const pct=Math.max(0,Math.min(100,p)); const h=Math.round(p*1.2); return `linear-gradient(90deg, hsl(${h} 90% 50%), hsl(${h} 90% 50%))`; }
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
  if(optList) optList.innerHTML='';
  optPanel?.classList.remove('hidden'); if(optBtn) optBtn.disabled=true;

  if(optProgressFill){ optProgressFill.style.width='0%'; optProgressFill.style.background=colorForPct(0); }
  if(optProgressLabel) optProgressLabel.textContent='0%';

  const total=OPT_QUEUE.length; let processed=0;
  for(const name of OPT_QUEUE){
    if(optAbort.signal.aborted) break;
    const from=Math.max(10,Math.round(30+Math.random()*25)); // 30–55%
    const row=createOptItem(name,from);
    const bar=row.querySelector('.opt-bar');
    const fill=row.querySelector('.opt-fill');
    const mini=row.querySelector('.opt-mini-label');
    optList?.prepend(row);

    await animateFill(fill, from, 100, 900, v=>{
      const pct=Math.round(v);
      if(mini) mini.textContent=pct+'%';
      if(bar) bar.setAttribute('aria-valuenow', String(pct));
      fill.style.background=colorForPct(v);
    });

    // Eco al ticker (uno por paso)
    const keys=['scan','torrente','operativos','autorreparacion','depuracion'];
    const k=keys[Math.floor(Math.random()*keys.length)];
    setCheck(k, Math.round(60+Math.random()*40));

    // Progreso general
    processed++;
    const gpct=Math.round((processed/total)*100);
    if(optProgressFill){ optProgressFill.style.width=gpct+'%'; optProgressFill.style.background=colorForPct(gpct); }
    if(optProgressLabel) optProgressLabel.textContent=gpct+'%';

    await sleep(250);
    row.remove();
  }

  if(optProgress && optProgressLabel && optProgressLabel.textContent==='100%'){
    const prev=optProgress.style.boxShadow;
    optProgress.style.boxShadow='0 0 18px rgba(46,234,138,.9), 0 0 36px rgba(46,234,138,.55)';
    setTimeout(()=>{ optProgress.style.boxShadow=prev||''; },320);
  }

  optPanel?.classList.add('hidden');
  optRunning=false; if(optBtn) optBtn.disabled=false;
}

/* ========= Audio / Música ========= */
// MUY IMPORTANTE: los navegadores solo permiten audio tras un gesto del usuario.
// Por eso empezamos con el sonido en OFF y recién al hacer click lo activamos.
let audioCtx=null, masterGain=null, humOsc=null, humGain=null;
let soundOn=false; // <-- empieza en OFF para coincidir con el botón
let musicBuffer=null, musicSource=null, musicGain=null; const MUSIC_URL='music.mp3';

function ensureAudio(){ if(audioCtx) return; audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  masterGain=audioCtx.createGain(); masterGain.gain.value=0.0009; masterGain.connect(audioCtx.destination);
}
async function loadMusicOnce(){
  try{ ensureAudio(); if(musicBuffer) return;
    const res=await fetch(MUSIC_URL); if(!res.ok) throw new Error('No se pudo cargar music.mp3');
    const ab=await res.arrayBuffer(); musicBuffer=await audioCtx.decodeAudioData(ab);
  }catch(err){ console.warn('Música: ',err.message); }
}
function startHum(){ if(!audioCtx||humOsc||!soundOn) return;
  humOsc=audioCtx.createOscillator(); humGain=audioCtx.createGain();
  humOsc.type='sawtooth'; humOsc.frequency.value=110; humGain.gain.value=0.0005;
  humOsc.connect(humGain).connect(masterGain); humOsc.start();
}
function stopHum(){ if(!humOsc) return; try{ humGain.gain.exponentialRampToValueAtTime(0.00001,audioCtx.currentTime+0.2); humOsc.stop(audioCtx.currentTime+0.25);}catch{} humOsc=null; humGain=null; }
function startMusic(){ if(!audioCtx||!soundOn||!musicBuffer) return; stopMusic();
  musicSource=audioCtx.createBufferSource(); musicSource.buffer=musicBuffer; musicSource.loop=true;
  if(!musicGain){ musicGain=audioCtx.createGain(); musicGain.gain.value=0.12; musicGain.connect(audioCtx.destination); }
  musicSource.connect(musicGain); musicSource.start(0);
}
function stopMusic(){ try{ musicSource?.stop(0); musicSource?.disconnect(); }catch{} musicSource=null; }

/* ========= Flujo de inicio ========= */
let isOn=false;
function startAppFlow(){
  // Oculta overlay
  const overlay=$id('overlay'); overlay && overlay.classList.add('is-hidden');

  // Recuento en overlay
  initWelcome();

  // Construye gauges y los habilita
  buildGrid();
  isOn=true;
  toggleModules(true);

  // Estado base del ticker
  setCheck('scan',10); setCheck('torrente',20); setCheck('operativos',25); setCheck('autorreparacion',8); setCheck('depuracion',12);

  // Primer render de HUD/Edad
  renderHeaderInfo(new Date()); renderAge();
}

/* ========= Wiring de botones ========= */
document.addEventListener('DOMContentLoaded', ()=>{
  // Textos iniciales coherentes
  const sb = $id('btn-sound'); if(sb) sb.textContent = 'Sonido: OFF';

  // Refrescos en vivo
  setInterval(renderAge,1000);
  setInterval(()=>renderHeaderInfo(new Date()),1000);

  // Botón Comenzar
  $id('btn-start')?.addEventListener('click', startAppFlow);

  // Botón Power
  $id('btn-power')?.addEventListener('click', ()=>{
    isOn=!isOn;
    if(isOn){ startAppFlow(); } else {
      // Apagar: dejar gauges en espera
      document.querySelectorAll('.card').forEach(c=>{ c.querySelector('.gauge')?.classList.remove('neon'); setVisual(c,0,false); setStatus(c,'En espera','bad'); });
      toggleModules(false);
    }
    $id('btn-power').textContent = isOn ? 'Apagar' : 'Encender';
  });

  // Botón Optimizer
  $id('btn-optimize')?.addEventListener('click', runOptimizer);

  // Botón Sonido (habilita audio y música con gesto del usuario)
  $id('btn-sound')?.addEventListener('click', async ()=>{
    ensureAudio();
    try{ await audioCtx.resume(); }catch{}
    soundOn = !soundOn;
    $id('btn-sound').textContent = 'Sonido: ' + (soundOn ? 'ON' : 'OFF');
    if(soundOn){
      startHum();
      await loadMusicOnce();
      startMusic();
    }else{
      stopMusic();
      stopHum();
    }
  });
});
