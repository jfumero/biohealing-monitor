/*********************************************************
 * CONFIGURACIÓN DEL PACIENTE Y ESTADO
 *********************************************************/
const PACIENTE = {
  nombre: "Jonathan Fumero Mesa",
  nacimiento: new Date("1976-12-04T00:43:00-03:00") // unificado 00:43
};

let sistemaEncendido = false;
let sonidoOn = true;

/*********************************************************
 * UTILIDADES BÁSICAS
 *********************************************************/
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function two(n){ return n<10? "0"+n : ""+n; }

function duracionHumana(ms){
  const s = Math.floor(ms/1000);
  const d = Math.floor(s/86400);
  const h = Math.floor((s%86400)/3600);
  const m = Math.floor((s%3600)/60);
  const r = [];
  if(d) r.push(d+"d");
  if(h) r.push(h+"h");
  if(m) r.push(m+"m");
  r.push((s%60)+"s");
  return r.join(" ");
}

function calcularEdadViva(nac){
  const ahora = new Date();
  const diff = ahora - nac;
  // años exactos con decimales para "viva"
  const years = diff / (365.2425*24*3600*1000);
  return years;
}

function signoZodiaco(date){
  const d = date, m = d.getMonth()+1, day = d.getDate();
  const tbl = [
    [1,20,"Capricornio"],[2,19,"Acuario"],[3,21,"Piscis"],[4,20,"Aries"],[5,21,"Tauro"],
    [6,21,"Géminis"],[7,23,"Cáncer"],[8,23,"Leo"],[9,23,"Virgo"],[10,23,"Libra"],
    [11,22,"Escorpio"],[12,22,"Sagitario"],[12,32,"Capricornio"]
  ];
  for(let i=0;i<tbl.length-1;i++){
    const [mm,dd,name] = tbl[i], [mm2,dd2] = tbl[i+1];
    if((m===mm && day>=dd) || (m===mm2 && day<dd2)) return name;
  }
  return "—";
}

function zodiacoChino(date){
  const y = date.getFullYear();
  const animals = ["Rata","Buey","Tigre","Conejo","Dragón","Serpiente","Caballo","Cabra","Mono","Gallo","Perro","Cerdo"];
  const idx = (y - 1900) % 12;
  const elements = ["Madera","Fuego","Tierra","Metal","Agua"];
  const elem = elements[Math.floor(((y - 1924) % 10)/2)];
  return animals[(idx+12)%12] + " (" + elem + ")";
}

function faseLunarAprox(date=new Date()){
  // algoritmo simple sin astronomía real (suficiente para estética)
  const lp = 2551443; // duración lunación en s
  const now = date.getTime()/1000;
  const new_moon = Date.UTC(2001,0,24,13,35)/1000; // referencia
  const phase = ((now - new_moon) % lp) / lp;
  const pct = Math.round(phase*100);
  let nombre = "Nueva";
  if(phase<0.25) nombre = "Creciente";
  else if(phase<0.5) nombre = "Cuarto creciente";
  else if(phase<0.75) nombre = "Menguante";
  else nombre = "Cuarto menguante";
  return `${nombre} ~${pct}%`;
}

function estadoCircadiano(h = new Date().getHours()){
  if (h>=6 && h<10) return "Alerta matutina";
  if (h>=10 && h<14) return "Desempeño pico";
  if (h>=14 && h<18) return "Ligera siesta";
  if (h>=18 && h<22) return "Activación suave";
  return "Descanso/recuperación";
}

function biorritmos(baseDate, today=new Date()){
  // biorritmos clásicos: Físico 23d, Emocional 28d, Intelectual 33d
  const dayMs = 86400000;
  const d = Math.floor((+today - +baseDate)/dayMs);
  function wave(p){ return Math.sin(2*Math.PI*d/p); }
  const F = wave(23), E = wave(28), I = wave(33);
  const fmt = x => (x*100).toFixed(0)+"%";
  return `F:${fmt(F)} E:${fmt(E)} I:${fmt(I)}`;
}

/*********************************************************
 * OVERLAY / CONTADORES INICIALES
 *********************************************************/
const overlay = $("#overlay");
const elNanoTotal = $("#nano-total");
const elNanoActivos = $("#nano-activos");
const barraOverlay = $("#barra-progreso");

let overlayTick = 0;
let overlayTimer = setInterval(()=>{
  overlayTick++;
  const total = 5000 + Math.floor(overlayTick*37*Math.random());
  const activos = Math.floor(total*(0.72 + 0.2*Math.random()));
  elNanoTotal.textContent = total.toLocaleString("es-UY");
  elNanoActivos.textContent = activos.toLocaleString("es-UY");
  const pct = Math.min(100, Math.floor(overlayTick*4));
  barraOverlay.style.width = pct+"%";
  if (pct>=100) clearInterval(overlayTimer);
}, 120);

$("#btn-comenzar")?.addEventListener("click", ()=> overlay.style.display="none");
$("#btn-optimizar")?.addEventListener("click", ()=> iniciarOptimizer());

/*********************************************************
 * HUD / DATOS VIVOS
 *********************************************************/
$("#paciente").textContent = PACIENTE.nombre;

function tickHUD(){
  const yrs = calcularEdadViva(PACIENTE.nacimiento);
  $("#edad").textContent = yrs.toFixed(8)+" años";
  $("#zodiaco").textContent = signoZodiaco(PACIENTE.nacimiento);
  $("#chino").textContent = zodiacoChino(PACIENTE.nacimiento);
  $("#luna").textContent = faseLunarAprox(new Date());
  $("#circadiano").textContent = estadoCircadiano();
  $("#biorritmos").textContent = biorritmos(PACIENTE.nacimiento);
}
setInterval(tickHUD, 250);
tickHUD();

/*********************************************************
 * AUDIO: HUM + MÚSICA (al ENCENDER)
 *********************************************************/
let audioCtx, humNode, musicEl, musicLoaded=false;

function ensureAudio(){
  if (!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
}

function startHum(){
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = 31;
  gain.gain.value = 0.02;
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  humNode = {osc,gain};
}
function stopHum(){
  if (humNode?.osc){
    try{ humNode.osc.stop(); }catch{}
    humNode = null;
  }
}

function loadMusicOnce(){
  return new Promise((resolve)=>{
    if (musicLoaded) return resolve();
    musicEl = new Audio("music.mp3");
    musicEl.loop = true;
    musicEl.preload = "auto";
    musicEl.addEventListener("canplaythrough", ()=>{
      musicLoaded = true; resolve();
    }, {once:true});
    musicEl.load();
  });
}
function startMusic(){ if (musicEl) musicEl.play().catch(()=>{}); }
function stopMusic(){ if (musicEl) try{ musicEl.pause(); }catch{} }

function setSonido(on){
  sonidoOn = !!on;
  if (!on){ stopHum(); stopMusic(); }
  else {
    ensureAudio();
    startHum();
    if (sistemaEncendido){
      loadMusicOnce().then(startMusic);
    }
  }
}
$("#btn-sonido")?.addEventListener("click", ()=> setSonido(!sonidoOn));

/*********************************************************
 * POWER ON / OFF
 *********************************************************/
$("#btn-encender")?.addEventListener("click", async ()=>{
  if (sistemaEncendido) return;
  sistemaEncendido = true;
  $("#estado-led").style.background = "#1df254";
  $("#estado-led").style.boxShadow = "0 0 10px #1df254";

  ensureAudio();
  if (audioCtx.state === "suspended") await audioCtx.resume();

  if (sonidoOn){
    startHum();
    await loadMusicOnce();
    startMusic(); // música comienza al ENCENDER (tu preferencia)
  }

  iniciarGauges();
  iniciarOptimizer();
  startTicker();
});

$("#btn-apagar")?.addEventListener("click", ()=>{
  if (!sistemaEncendido) return;
  sistemaEncendido = false;
  $("#estado-led").style.background = "#ff4d4f";
  $("#estado-led").style.boxShadow = "0 0 10px #ff4d4f";

  stopMusic();
  stopHum();
  detenerGauges();
  detenerOptimizer();
  stopTicker();
});

/*********************************************************
 * CANVAS “TORRENTE SANGUÍNEO”
 *********************************************************/
const canvas = $("#canvas");
const ctx = canvas.getContext("2d",{alpha:true});
let W=0,H=0, particles=[];

function resize(){
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function mkParticle(){
  const t = Math.random()<0.12? "nanobot":"celula";
  return {
    t,
    x: Math.random()*W,
    y: Math.random()*H,
    r: t==="nanobot"? 2.2+Math.random()*1.4 : 3.5+Math.random()*2.0,
    vx: 0.3 + Math.random()*1.2,
    vy: (Math.random()-0.5)*0.4,
    a: Math.random()*Math.PI*2
  };
}
for (let i=0;i<180;i++) particles.push(mkParticle());

function draw(){
  ctx.clearRect(0,0,W,H);
  // leve tinte
  ctx.fillStyle = "rgba(5,20,28,0.35)";
  ctx.fillRect(0,0,W,H);

  for (const p of particles){
    p.x += p.vx;
    p.y += p.vy + Math.sin((p.a+=0.02))*0.05;
    if (p.x>W+20) { p.x=-20; p.y=Math.random()*H; }

    if (p.t==="nanobot"){
      ctx.fillStyle = "rgba(0,255,200,0.9)";
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      // “antenas”
      ctx.strokeStyle="rgba(0,255,200,0.6)";
      ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+p.r+2,p.y-2); ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(255,60,60,0.6)";
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }
  }
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

/*********************************************************
 * GAUGES POR MÓDULO
 *********************************************************/
const estados = {}; // {modId:{val, tgt, running, txtEl}}
function toAngle(v){ // v:0..100 -> ángulo  -90°..+90°
  return (v/100)*Math.PI - Math.PI/2;
}
function interpText(modId, v){
  const pct = Math.round(v);
  const low = pct<40, mid = pct>=40 && pct<75, ok = pct>=85;
  switch(modId){
    case "glucosa":
      if(low) return "Glucemia baja/irregular: revisar ingesta y ritmo.";
      if(mid) return "Glucemia modulándose; evitar picos azucarados.";
      return ok? "Glucemia estable y en rango óptimo." : "Glucemia estable.";
    case "presion":
      if(low) return "Presión inestable o baja; hidratarse y descansar.";
      if(mid) return "Presión ajustándose; monitoreo recomendado.";
      return ok? "Presión arterial estable y óptima." : "Presión estable.";
    case "globulos":
      if(low) return "Hematíes/Leucocitos ajustándose.";
      if(mid) return "Recuento en estabilización.";
      return ok? "Hematología en rango ideal." : "Hematología estable.";
    case "detox":
      if(low) return "Inicio de depuración: fase lenta.";
      if(mid) return "Detox en progreso; soporte hepático.";
      return ok? "Depuración avanzada y eficiente." : "Detox estable.";
    default:
      return "Estabilizando…";
  }
}

function drawGauge(ctx, v){
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const cx = w/2, cy = h*0.95, r = Math.min(w*0.48, h*0.95);
  ctx.clearRect(0,0,w,h);

  // arco base
  ctx.strokeStyle="#0b3a4f"; ctx.lineWidth=8;
  ctx.beginPath(); ctx.arc(cx,cy,r,-Math.PI,0); ctx.stroke();

  // ticks
  ctx.strokeStyle="#0ff6"; ctx.lineWidth=2;
  for (let i=0;i<=10;i++){
    const a = -Math.PI + i*(Math.PI/10);
    const x1 = cx + Math.cos(a)* (r-10);
    const y1 = cy + Math.sin(a)* (r-10);
    const x2 = cx + Math.cos(a)* (r);
    const y2 = cy + Math.sin(a)* (r);
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  }

  // aguja
  const a = toAngle(v)+Math.PI/2; // convertir a arco inferior
  ctx.strokeStyle="#00ffd0"; ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(cx,cy);
  ctx.lineTo(cx + Math.cos(a)*(r-14), cy + Math.sin(a)*(r-14));
  ctx.stroke();

  // valor
  ctx.fillStyle="#bfefff";
  ctx.font="bold 14px ui-monospace,monospace";
  ctx.textAlign="center";
  ctx.fillText(Math.round(v)+"%", cx, cy-8);
}

function iniciarGauges(){
  $$(".modulo").forEach(mod=>{
    const id = mod.getAttribute("data-id");
    const c = $(".gauge", mod);
    const ctx = c.getContext("2d");
    const txt = $("#"+id+"-txt");
    c.width = 160; c.height = 100;

    estados[id] = {val: 25+Math.random()*10, tgt: 25, running:false, ctx, txt};

    drawGauge(ctx, estados[id].val);

    $(".btn-activar", mod).onclick = ()=>{
      estados[id].tgt = 75 + Math.random()*20;
      estados[id].running = true;
      txt.textContent = "Calibrando…";
    };
    $(".btn-detener", mod).onclick = ()=>{
      estados[id].tgt = 30 + Math.random()*10;
      estados[id].running = false;
      txt.textContent = "En espera";
    };
  });
}

function stepGauges(){
  for (const id in estados){
    const st = estados[id];
    if (!st) continue;
    const spd = 0.35;
    if (Math.abs(st.val - st.tgt)>0.05){
      st.val += (st.tgt - st.val)*0.03 + (Math.random()-0.5)*spd*0.02;
      st.val = Math.max(0, Math.min(100, st.val));
      drawGauge(st.ctx, st.val);
      if (st.running){
        st.txt.textContent = interpText(id, st.val);
      }
    } else if (st.running) {
      st.txt.textContent = interpText(id, st.val);
    }
  }
  requestAnimationFrame(stepGauges);
}
requestAnimationFrame(stepGauges);

function detenerGauges(){
  for (const id in estados){
    if (estados[id]){
      estados[id].tgt = 25 + Math.random()*10;
      estados[id].running = false;
      estados[id].txt.textContent = "En espera";
    }
  }
}

/*********************************************************
 * OPTIMIZER (cola de tareas con barra general)
 *********************************************************/
let optimizerTimer=null, optimizerPct=0;

const OPT_ITEMS = [
  "Hidratación celular","Oxigenación tisular","Nutrientes esenciales",
  "Sistema inmune","Homeostasis energética","Hábitos circadianos",
  "Reparación de ADN","Autofagia regulada","Depuración hepática",
  "Microbiota equilibrada","Inflamación controlada","Regeneración tisular"
];

function iniciarOptimizer(){
  const cola = $("#cola");
  cola.innerHTML = "";
  optimizerPct = 0;
  $("#barra-general").style.width = "0%";

  let i=0;
  optimizerTimer && clearInterval(optimizerTimer);
  optimizerTimer = setInterval(()=>{
    if (i>=OPT_ITEMS.length){
      clearInterval(optimizerTimer);
      optimizerTimer=null;
      return;
    }
    const row = document.createElement("div");
    row.className="row";
    row.innerHTML = `<span>• ${OPT_ITEMS[i]}</span><div class="barra" style="flex:1"><div style="width:0%"></div></div>`;
    cola.appendChild(row);

    let p=0; const bar = row.querySelector(".barra>div");
    const t = setInterval(()=>{
      p += 10+Math.random()*12;
      if (p>=100){ p=100; clearInterval(t); }
      bar.style.width = p+"%";
    }, 120);

    i++;
    optimizerPct = Math.round((i/OPT_ITEMS.length)*100);
    $("#barra-general").style.width = optimizerPct+"%";
  }, 800);
}

function detenerOptimizer(){
  optimizerTimer && clearInterval(optimizerTimer);
  optimizerTimer=null;
  $("#cola").innerHTML = "";
  $("#barra-general").style.width = "0%";
}

/*********************************************************
 * TICKER INFERIOR
 *********************************************************/
let tickerTimer=null;
function startTicker(){
  const el = $("#ticker-texto");
  const base = [
    ()=>`Escaneo sistémico ${Math.floor(Math.random()*9999)} pkt/s`,
    ()=>`Nanorobots en torrente: ${ (4500+Math.floor(Math.random()*2000)).toLocaleString("es-UY") }`,
    ()=>`Operativos: ${ (3200+Math.floor(Math.random()*1400)).toLocaleString("es-UY") }`,
    ()=>`Autorreparación: ${ (70+Math.floor(Math.random()*20)) }%`,
    ()=>`Depuración activa: ${ (60+Math.floor(Math.random()*35)) }%`
  ];
  function feed(){
    el.textContent = base.map(fn=>fn()).join("  •  ");
  }
  feed();
  tickerTimer && clearInterval(tickerTimer);
  tickerTimer = setInterval(feed, 2500);
}
function stopTicker(){
  tickerTimer && clearInterval(tickerTimer);
  tickerTimer=null;
  $("#ticker-texto").textContent="";
}
