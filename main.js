/** ===================
 *  Fondo animado (torrente)
 *  =================== */
class BloodstreamFX {
  constructor(canvas){
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.running = false;
    this.particles = [];
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
    this.seed();
  }
  resize(){
    this.c.width = innerWidth; this.c.height = innerHeight;
  }
  seed(){
    const n = Math.min(160, Math.floor((innerWidth*innerHeight)/20000));
    this.particles = Array.from({length:n}, ()=>({
      x: Math.random()*this.c.width,
      y: Math.random()*this.c.height,
      v: 0.6 + Math.random()*1.2,
      r: 0.7 + Math.random()*1.8,
      a: Math.random()*Math.PI*2
    }));
  }
  start(){ if(this.running) return; this.running = true; this.loop(); }
  stop(){ this.running = false; }
  loop(){
    if(!this.running) return;
    const {ctx, c} = this;
    ctx.clearRect(0,0,c.width,c.height);
    ctx.globalAlpha = 0.9;
    // leve gradiente
    const g = ctx.createLinearGradient(0,0,c.width,c.height);
    g.addColorStop(0,'rgba(20,35,70,0.10)');
    g.addColorStop(1,'rgba(10,20,40,0.08)');
    ctx.fillStyle = g; ctx.fillRect(0,0,c.width,c.height);
    // partículas
    ctx.globalAlpha = 0.8;
    for(const p of this.particles){
      p.x += Math.cos(p.a) * p.v * 0.6 + 0.2;
      p.y += Math.sin(p.a) * p.v * 0.2 + Math.sin(p.x*0.01)*0.4;
      if(p.x > c.width+20) p.x = -20;
      if(p.y > c.height+20) p.y = -20;
      if(p.y < -20) p.y = c.height+20;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = 'rgba(60,120,255,0.25)';
      ctx.fill();
    }
    requestAnimationFrame(()=>this.loop());
  }
}

/** ===================
 *  Utilidades simples
 *  =================== */
const clamp = (v,min,max)=> Math.max(min, Math.min(max,v));
const lerp = (a,b,t)=> a + (b-a)*t;
const pad2 = n => String(n).padStart(2,'0');

function toLiveAgeString(birth){
  const now = new Date();
  let diff = (now - birth)/1000 | 0;
  const s = diff%60; diff=(diff/60)|0;
  const m = diff%60; diff=(diff/60)|0;
  const h = diff%24; diff=(diff/24)|0;
  const d = diff%30; const mo = ((diff/30)|0)%12; const y = (diff/365)|0;
  return `${y}a ${mo}m ${d}d ${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

/** ===================
 *  Audio
 *  =================== */
let soundOn = false;
const humCtx = new (window.AudioContext || window.webkitAudioContext)();
let humOsc, humGain;
function startHum(){
  if(humOsc) return;
  humOsc = humCtx.createOscillator();
  humGain = humCtx.createGain();
  humOsc.type='sine';
  humOsc.frequency.value = 80;
  humGain.gain.value = 0.03;
  humOsc.connect(humGain).connect(humCtx.destination);
  humOsc.start();
}
function stopHum(){
  if(humOsc){ humOsc.stop(); humOsc.disconnect(); humOsc=null; }
  if(humGain){ humGain.disconnect(); humGain=null; }
}
const musicEl = new Audio('./music.mp3');
musicEl.loop = true; musicEl.volume = 0.18;

function startMusic(){
  musicEl.currentTime = 0;
  musicEl.play().catch(()=>{/* autoplay puede bloquearse hasta click */});
}
function stopMusic(){ musicEl.pause(); }

/** ===================
 *  HUD básico (lúdico)
 *  =================== */
function zodiacWest(date){
  const m = date.getUTCMonth()+1, d = date.getUTCDate();
  const k = ['Cap','Acu','Pis','Aries','Tau','Gem','Cán','Leo','Vir','Lib','Esc','Sag'];
  const cuts = [120,219,321,420,521,621,723,823,923,1023,1122,1222];
  const md = m*100+d;
  let i = cuts.findIndex(c=>md< c); if(i<0) i=0;
  return k[i];
}
function zodiacChinese(y){
  const animals = ['Rata','Buey','Tigre','Conejo','Dragón','Serpiente','Caballo','Cabra','Mono','Gallo','Perro','Cerdo'];
  return animals[(y - 1900) % 12];
}
function moonPhase(date){
  // aproximación simple
  const lp = 2551443; // seg ciclo sinódico
  const new_moon = Date.UTC(2001,0,1,0,0,0)/1000;
  const now = date.getTime()/1000;
  const phase = ((now - new_moon) % lp)/lp;
  const pct = Math.round(phase*100);
  return `${pct}%`;
}
function circadianNow(date){
  const h = date.getHours();
  const labels = ['Sueño','Sueño','Sueño','Sueño','Sueño','Amanece','Arranque','Alta alerta','Foco','Foco','Descenso','Pausa','Digestión','Pico 2','Social','Relajo','Atardecer','Baja alerta','Noche','Noche','Noche','Noche','Noche','Noche'];
  return labels[h] || '—';
}
function biorhythm(birth, targetDate=new Date()){
  const days = (targetDate - birth)/(1000*60*60*24);
  const phys = Math.sin(2*Math.PI*days/23);
  const emo  = Math.sin(2*Math.PI*days/28);
  const intel= Math.sin(2*Math.PI*days/33);
  const pct = x => Math.round((x*0.5+0.5)*100);
  return { phys:pct(phys), emo:pct(emo), intel:pct(intel) };
}

/** ===================
 *  Gauges + módulos
 *  =================== */
const MODULES = [
  { id:'organos',   name:'Órganos internos' },
  { id:'piel',      name:'Piel y tejido' },
  { id:'glucosa',   name:'Glucosa' },
  { id:'globulos',  name:'Glóbulos (inmunidad)' },
  { id:'presion',   name:'Presión arterial' },
  { id:'detox',     name:'Detox hepático' }
];

function interpText(modId, v){
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
      if(low)  return 'Inmunidad baja; priorizar descanso y micronutrientes.';
      if(mid)  return 'Sistema inmune activándose.';
      return ok ? 'Inmunidad fuerte y balanceada.' : 'Inmunidad adecuada.';
    case 'organos':
      if(low)  return 'Funciones orgánicas en recuperación.';
      if(mid)  return 'Funciones estabilizando.';
      return ok ? 'Órganos en óptimo rendimiento.' : 'Funciones estables.';
    case 'piel':
      if(low)  return 'Tejidos resecos/estresados; hidratar y nutrir.';
      if(mid)  return 'Regeneración en curso.';
      return ok ? 'Piel y tejido en excelente estado.' : 'Piel/tejido estables.';
    case 'detox':
      if(low)  return 'Detox lento; reducir cargas y favorecer hígado.';
      if(mid)  return 'Depuración en progreso.';
      return ok ? 'Depuración eficiente y limpia.' : 'Depuración estable.';
    default:
      return '';
  }
}

function makeGaugeDom(mod){
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>${mod.name}</h3>
    <div class="gauge" id="g-${mod.id}">
      <svg width="180" height="120" viewBox="0 0 180 120" aria-hidden="true">
        <path d="M20 100 A70 70 0 1 1 160 100" fill="none" stroke="#20304f" stroke-width="10" />
        <path id="arc-${mod.id}" d="M20 100 A70 70 0 1 1 160 100" fill="none" stroke="#39f" stroke-width="10" stroke-linecap="round" stroke-dasharray="0 439"/>
        <circle id="needle-${mod.id}" cx="90" cy="100" r="5" fill="#2fd184"/>
      </svg>
    </div>
    <div class="status">Estado: <span id="st-${mod.id}">En espera</span> · Valor: <strong id="val-${mod.id}">0%</strong></div>
    <div class="interp" id="tx-${mod.id}">—</div>
  `;
  return card;
}

function animateTo(modId, from, to, ms){
  const arc = document.getElementById(`arc-${modId}`);
  const needle = document.getElementById(`needle-${modId}`);
  const valEl = document.getElementById(`val-${modId}`);
  const tx = document.getElementById(`tx-${modId}`);
  const start = performance.now();
  const totalLen = 439; // aprox arco
  function step(t){
    const k = clamp((t-start)/ms,0,1);
    const v = Math.round(lerp(from,to,k));
    const dash = Math.round(totalLen * v/100);
    arc.setAttribute('stroke-dasharray', `${dash} ${totalLen-dash}`);
    const ang = Math.PI + Math.PI * v/100; // 180° -> 360°
    const cx = 90 + Math.cos(ang)*70;
    const cy = 100 + Math.sin(ang)*70;
    needle.setAttribute('cx', cx.toFixed(1));
    needle.setAttribute('cy', cy.toFixed(1));
    valEl.textContent = `${v}%`;
    tx.textContent = interpText(modId, v);
    if(k<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/** ===================
 *  Ticker
 *  =================== */
const CHECKS = ['escaneo','recuento','operativos','autorreparacion','depuracion'];
function setCheck(id, pct){
  const el = document.getElementById(`check-${id}`);
  if(!el) return;
  el.style.width = `${clamp(pct,0,100)}%`;
}

/** ===================
 *  Optimizer
 *  =================== */
const OPT_ITEMS = [
  'Agua celular','Oxígeno','Neurotransmisores','Hormonas','Estilo de vida','Núcleo celular'
];

function runOptimizer(){
  const queue = document.getElementById('opt-queue');
  queue.innerHTML = '';
  let done = 0;
  OPT_ITEMS.forEach((name, i)=>{
    const item = document.createElement('div');
    item.className = 'opt-item';
    item.innerHTML = `
      <div>${name}</div>
      <div class="mini"><div id="mini-${i}"></div></div>
    `;
    queue.appendChild(item);
  });

  function fillMini(i){
    const bar = document.getElementById(`mini-${i}`);
    let v = 0;
    const h = setInterval(()=>{
      v += 5 + Math.random()*10;
      if(v>=100){ v=100; clearInterval(h); done++; maybeUpdateProgress(); if(i+1<OPT_ITEMS.length) fillMini(i+1); }
      bar.style.width = `${v}%`;
    }, 120);
  }
  fillMini(0);

  function maybeUpdateProgress(){
    const pct = Math.round(done/OPT_ITEMS.length*100);
    const fill = document.getElementById('opt-progress-fill');
    const lab  = document.getElementById('opt-progress-label');
    fill.style.width = `${pct}%`;
    lab.textContent = `${pct}%`;
  }
}

/** ===================
 *  Estado / Wiring
 *  =================== */
document.addEventListener('DOMContentLoaded', ()=>{
  const fx = new BloodstreamFX(document.getElementById('fx-canvas'));

  // edad en vivo
  const birth = new Date(Date.UTC(1976,11,4,3,43-3)); // 1976-12-04 00:43 -03:00
  setInterval(()=>{ document.getElementById('live-age').textContent = toLiveAgeString(birth); }, 1000);

  // HUD cada 1s
  setInterval(()=>{
    const now = new Date();
    document.getElementById('hud-west').textContent = zodiacWest(now);
    document.getElementById('hud-chinese').textContent = zodiacChinese(now.getFullYear());
    document.getElementById('hud-moon').textContent = moonPhase(now);
    document.getElementById('hud-circ').textContent = circadianNow(now);
    const bio = biorhythm(birth, now);
    document.getElementById('bio-f').textContent = `${bio.phys}%`;
    document.getElementById('bio-e').textContent = `${bio.emo}%`;
    document.getElementById('bio-i').textContent = `${bio.intel}%`;
  }, 1000);

  // construir módulos
  const grid = document.getElementById('grid');
  MODULES.forEach(mod=>{
    const card = makeGaugeDom(mod);
    grid.append(card);
  });

  // Overlay iniciar
  const overlay = document.getElementById('overlay');
  const startBtn = document.getElementById('opt-start-btn');
  const updateOverlayBars = ()=>{
    let a=0,b=0;
    const h = setInterval(()=>{
      a = clamp(a+8,0,100);
      b = clamp(b+12,0,100);
      document.getElementById('bar-total').style.width = `${a}%`;
      document.getElementById('bar-oper').style.width = `${b}%`;
      document.getElementById('stat-total').textContent = `${Math.round(10000 * a/100)}`;
      document.getElementById('stat-oper').textContent  = `${Math.round(7500  * b/100)}`;
      if(a>=100 && b>=100) clearInterval(h);
    }, 80);
  };
  updateOverlayBars();

  startBtn.addEventListener('click', ()=>{
    overlay.style.display='none';
    document.getElementById('power-btn').click(); // enciende
    if(soundOn){ startMusic(); }
  });

  // Power / Sonido / Ayuda
  const powerBtn = document.getElementById('power-btn');
  powerBtn.addEventListener('click', ()=>{
    const on = powerBtn.dataset.on === '1';
    if(on){
      powerBtn.dataset.on='0'; powerBtn.textContent='Encender';
      fx.stop();
      // status
      MODULES.forEach(m=>{ document.getElementById(`st-${m.id}`).textContent='En espera'; });
    }else{
      powerBtn.dataset.on='1'; powerBtn.textContent='Apagar';
      fx.start();
      // animar gauges con valores aleatorios
      MODULES.forEach(m=>{
        document.getElementById(`st-${m.id}`).textContent='Estable';
        const target = 55 + Math.random()*40; // 55-95%
        animateTo(m.id, 0, Math.round(target), 1400 + Math.random()*600);
      });
      // ticker
      setCheck('escaneo', 60);
      setTimeout(()=>setCheck('recuento', 45), 600);
      setTimeout(()=>setCheck('operativos', 72), 1100); // <- id correcto
      setTimeout(()=>setCheck('autorreparacion', 38), 1500);
      setTimeout(()=>setCheck('depuracion', 50), 1900);
    }
  });

  const soundBtn = document.getElementById('sound-btn');
  soundBtn.addEventListener('click', async ()=>{
    if(!soundOn){
      // activar
      if(humCtx.state === 'suspended'){ await humCtx.resume(); }
      startHum();
      soundOn = true;
      soundBtn.textContent = 'Sonido: ON';
      // no arrancamos música automáticamente; requiere interacción explícita (overlay ya lo contempla)
    }else{
      stopHum(); stopMusic();
      soundOn = false;
      soundBtn.textContent = 'Sonido: OFF';
    }
  });

  const helpBtn = document.getElementById('help-btn');
  const help = document.getElementById('help-panel');
  helpBtn.addEventListener('click', ()=>{
    help.classList.toggle('hidden');
  });

  // Optimizer
  document.getElementById('opt-btn').addEventListener('click', runOptimizer);

  // página oculta/visible pausa/reanuda FX y música
  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden){ fx.stop(); musicEl.pause(); }
    else{
      if(powerBtn.dataset.on==='1') fx.start();
      if(soundOn) musicEl.play().catch(()=>{});
    }
  });
});
