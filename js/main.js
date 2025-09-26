// ===== Config paciente =====
const patientName = 'Jonathan Fumero Mesa';
function makeLocalDate(y,m,d,hh,mm){ const dt=new Date(Date.UTC(y,m-1,d,hh,mm)); return new Date(dt.getTime()-3*3600*1000); }
const birth = makeLocalDate(1976,12,4,0,50);

// ===== FX Futurista: Fondo "torrente sanguíneo" =====
class BloodstreamFX{
  constructor(canvasId){
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas?.getContext('2d') || null;
    this.pxRatio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    this.running=false; this.particles=[]; this.cells=[]; this.t=0;
    this.reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    this.resize=this.resize.bind(this); this.loop=this.loop.bind(this);
    if(this.canvas && this.ctx){ window.addEventListener('resize', this.resize, {passive:true}); this.resize(); this.initField(); }
  }
  resize(){
    const {innerWidth:w, innerHeight:h} = window;
    this.canvas.width = Math.floor(w * this.pxRatio);
    this.canvas.height= Math.floor(h * this.pxRatio);
    Object.assign(this.canvas.style,{width:w+'px',height:h+'px'});
  }
  initField(){
    const W=this.canvas.width, H=this.canvas.height;
    const isPhone = window.matchMedia?.('(max-width: 520px)')?.matches ?? false;
    const botsCount  = this.reduceMotion ? 50 : (isPhone ? 90 : 120);
    const cellsCount = this.reduceMotion ? 12 : (isPhone ? 22 : 30);
    this.particles = Array.from({length:botsCount},()=>({
      x:Math.random()*W, y:Math.random()*H,
      vx:(0.3+Math.random()*0.7)*this.pxRatio,
      amp:8+Math.random()*14, phase:Math.random()*Math.PI*2, r:0.4+Math.random()*1.0
    }));
    this.cells = Array.from({length:cellsCount},()=>({
      x:Math.random()*W, y:Math.random()*H,
      vx:(0.15+Math.random()*0.4)*this.pxRatio,
      amp:6+Math.random()*10, phase:Math.random()*Math.PI*2, r:1.5+Math.random()*1.5
    }));
  }
  start(){ if(!this.ctx||this.running) return; this.running=true; this.t=performance.now(); requestAnimationFrame(this.loop); }
  stop(){ if(!this.ctx) return; this.running=false; this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height); }
  loop(now){
    if(!this.running||!this.ctx) return;
    const {ctx,canvas}=this; const W=canvas.width, H=canvas.height; const dt=(now-this.t)/1000; this.t=now;
    const grd=ctx.createLinearGradient(0,0,0,H); grd.addColorStop(0,'#0b0a12'); grd.addColorStop(1,'#110b15'); ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);
    ctx.lineWidth=8*this.pxRatio; ctx.strokeStyle='rgba(255,120,160,.08)';
    for(let i=0;i<3;i++){ const baseY=(H/4)*(i+1)+Math.sin(now/900+i)*4*this.pxRatio;
      ctx.beginPath(); ctx.moveTo(0,baseY);
      for(let x=0;x<=W;x+=50*this.pxRatio){ const yy=baseY+Math.sin((x+now/5)/60+i)*2*this.pxRatio; ctx.lineTo(x,yy); }
      ctx.stroke();
    }
    for(const c of this.cells){
      ctx.fillStyle='rgba(240,90,126,0.7)'; ctx.beginPath(); ctx.arc(c.x,c.y,c.r*this.pxRatio,0,Math.PI*2); ctx.fill();
      c.x+=c.vx; c.y+=Math.sin((c.x+now/20)/60)*(0.3*this.pxRatio); if(c.x>W+10){c.x=-10; c.y=Math.random()*H;}
    }
    ctx.save(); ctx.globalCompositeOperation='lighter';
    for(const p of this.particles){
      const y=p.y+Math.sin(p.phase+now/600)*p.amp, r=p.r*this.pxRatio;
      const g=ctx.createRadialGradient(p.x,y,0,p.x,y,r*5);
      g.addColorStop(0,'rgba(90,209,255,.20)'); g.addColorStop(1,'rgba(90,209,255,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,y,r*5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#5ad1ff'; ctx.globalAlpha=.7; ctx.beginPath(); ctx.arc(p.x,y,r,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
      p.x+=p.vx*(1+Math.sin(now/1200)*.04); p.phase+=dt; if(p.x>W+10){p.x=-10; p.y=Math.random()*H;}
    }
    ctx.restore();
    requestAnimationFrame(this.loop);
  }
}

// ===== Edad: detallada (años, meses, días, horas, minutos, segundos) =====
function ageTextCompact(){
  const now=new Date(); let years=now.getFullYear()-birth.getFullYear();
  const after=(now.getMonth()>birth.getMonth())||(now.getMonth()==birth.getMonth()&&now.getDate()>=birth.getDate());
  if(!after) years--; return years+" años";
}
function ageTextDetailed(now=new Date()){
  let y=now.getFullYear()-birth.getFullYear();
  let m=now.getMonth()-birth.getMonth();
  let d=now.getDate()-birth.getDate();
  let H=now.getHours()-birth.getHours();
  let Mi=now.getMinutes()-birth.getMinutes();
  let S=now.getSeconds()-birth.getSeconds();
  if(S<0){S+=60;Mi--} if(Mi<0){Mi+=60;H--} if(H<0){H+=24;d--}
  if(d<0){const prevDays=new Date(now.getFullYear(),now.getMonth(),0).getDate(); d+=prevDays; m--}
  if(m<0){m+=12;y--}
  const s=(n,a,b)=>`${n} ${n===1?a:b}`;
  return `${s(y,'año','años')} ${s(m,'mes','meses')} ${s(d,'día','días')} ${s(H,'hora','horas')} ${s(Mi,'minuto','minutos')} ${s(S,'segundo','segundos')}`;
}
function renderAge(){
  const full=ageTextDetailed(new Date());
  const yearsOnly=ageTextCompact();
  const a1=document.getElementById('age'); if(a1) a1.textContent=full;
  const meta=document.getElementById('project-meta'); if(meta) meta.innerHTML=`Paciente: <b>${patientName}</b> · Edad: ${full}`;
  const a2=document.getElementById('ov-age'); if(a2) a2.textContent='Edad: '+yearsOnly;
}

// ===== Audio minimal (hum + beep) =====
let audioCtx=null, masterGain=null, humOsc=null, humGain=null;
let soundOn=true;
function ensureAudio(){ if(audioCtx) return; audioCtx=new(window.AudioContext||window.webkitAudioContext)(); masterGain=audioCtx.createGain(); masterGain.gain.value=0.0009; masterGain.connect(audioCtx.destination); }
function playBeep(){ if(!audioCtx||!soundOn) return; const o=audioCtx.createOscillator(), g=audioCtx.createGain(); o.type='sine'; o.frequency.value=880; g.gain.value=0.001; o.connect(g).connect(masterGain); o.start(); g.gain.exponentialRampToValueAtTime(0.00001,audioCtx.currentTime+0.12); o.stop(audioCtx.currentTime+0.14); }
function startHum(){ if(!audioCtx||humOsc||!soundOn) return; humOsc=audioCtx.createOscillator(); humGain=audioCtx.createGain(); humOsc.type='sawtooth'; humOsc.frequency.value=110; humGain.gain.value=0.0005; humOsc.connect(humGain).connect(masterGain); humOsc.start(); }
function stopHum(){ if(!humOsc) return; humGain.gain.exponentialRampToValueAtTime(0.00001,audioCtx.currentTime+0.2); humOsc.stop(audioCtx.currentTime+0.25); humOsc=null; humGain=null; }

// ===== Bio / astrología / circadiano =====
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
  return'Piscis ♓';
}
function chinese(y){return CHINESE[(y-1900)%12];}
function moon(d){const syn=29.530588853,ref=new Date(Date.UTC(2000,0,6,18,14)),days=(d-ref)/86400000,age=((days%syn)+syn)%syn;
  if(age<1.84566)return'Luna nueva 🌑';
  if(age<5.53699)return'Creciente visible 🌒';
  if(age<9.22831)return'Cuarto creciente 🌓';
  if(age<12.91963)return'Gibosa creciente 🌔';
  if(age<16.61096)return'Luna llena 🌕';
  if(age<20.30228)return'Gibosa menguante 🌖';
  if(age<23.99361)return'Cuarto menguante 🌗';
  return'Creciente menguante 🌘';
}
function circadian(d){const h=d.getHours()+d.getMinutes()/60;
  if(h>=22||h<6)return'Sueño / recuperación';
  if(h<9)return'Activación matinal';
  if(h<12)return'Alerta alta';
  if(h<14)return'Bajada posalmuerzo';
  if(h<18)return'Segundo pico de energía';
  return'Desaceleración vespertina';
}
function biorr(d){
  const days=Math.floor((new Date(d.getFullYear(),d.getMonth(),d.getDate()) - new Date(birth.getFullYear(),birth.getMonth(),birth.getDate()))/86400000);
  function renderBio(elId,label,period,emoji){
    const pct=Math.round(Math.sin(2*Math.PI*days/period)*100);
    const cls=pct>3?'bio-pos':(pct<-3?'bio-neg':'bio-neu');
    const sign=pct>0?'+':''; const el=document.getElementById(elId);
    if(el) el.innerHTML=`${label}: <span class="bio-val ${cls}">${sign}${pct}%</span> ${emoji}`;
  }
  renderBio('ov-bio-f','Físico',23,'💪'); renderBio('ov-bio-e','Emocional',28,'💖'); renderBio('ov-bio-i','Intelectual',33,'🧠');

  const cz=chinese(1976); const czTxt='Chino: '+cz+(cz==='Dragón'?' 🐉':'');
  const ovZ=document.getElementById('ov-zodiac'); if(ovZ) ovZ.textContent='Zodiaco: '+zodiac(new Date(1976,11,4));
  const ovC=document.getElementById('ov-czodiac'); if(ovC) ovC.textContent=czTxt;
  const ovM=document.getElementById('ov-moon'); if(ovM) ovM.textContent='Luna: '+moon(d);
  const ovCi=document.getElementById('ov-circ'); if(ovCi) ovCi.textContent='Circadiano: '+circadian(d);
}
function renderHeaderInfo(d=new Date()){
  const ageEl=document.getElementById('age'); if(ageEl) ageEl.textContent=ageTextDetailed(d);
  const set=(id,txt)=>{const el=document.getElementById(id); if(el) el.textContent=txt;};
  set('patient-name', patientName);
}

// ===== Overlay: contadores =====
function animateCounter(el,to,ms=3200){
  const start=0; const t0=performance.now();
  function step(t){const k=Math.min(1,(t-t0)/ms), eased=.5-.5*Math.cos(Math.PI*k); el.textContent=Math.round(start+(to-start)*eased).toLocaleString('es-UY'); if(k<1) requestAnimationFrame(step); }
  requestAnimationFrame(step);
}
function initWelcome(){
  const base=12_000_000, ops=Math.floor(base*(0.90+Math.random()*0.06));
  animateCounter(document.getElementById('n-total'),base,3200);
  animateCounter(document.getElementById('n-op'),ops,3400);
  const totalBar=document.getElementById('swarm-total-bar'); if(totalBar) totalBar.style.width='100%';
  setTimeout(()=>{ const sb=document.getElementById('swarm-bar'); if(sb) sb.style.width=Math.round(ops/base*100)+'%'; },700);
}

// ===== Power & overlay =====
const overlay=document.getElementById('overlay');
const startBtn=document.getElementById('startBtn');
const powerBtn=document.getElementById('power-btn');
const led=document.getElementById('led');
const soundBtn=document.getElementById('sound-btn');
const fx = new BloodstreamFX('fx-bloodstream');

if (soundBtn){
  soundBtn.addEventListener('click', async ()=>{
    ensureAudio(); try{ await audioCtx.resume(); }catch{}
    soundOn=!soundOn;
    soundBtn.textContent='Sonido: '+(soundOn?'ON':'OFF');
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    if(isOn && soundOn) startHum(); else stopHum();
  });
}
let isOn=false;
startBtn.onclick = async ()=>{
  overlay.classList.add('is-hidden');
  ensureAudio(); try{ await audioCtx.resume(); }catch{}
  if(!isOn) powerBtn.click();
  if(soundOn) startHum();
  fx.start();
};
powerBtn.onclick = ()=>{
  isOn=!isOn;
  powerBtn.textContent=isOn?'Apagar':'Encender';
  led.classList.toggle('on', isOn);
  toggleModules(isOn);
  if(!audioCtx) return;
  if(isOn && soundOn) startHum(); else stopHum();
  if(isOn){ fx.start(); renderHeaderInfo(new Date()); } else { fx.stop(); }
};
document.addEventListener('visibilitychange', ()=>{ if(document.hidden) fx.stop(); else if(isOn) fx.start(); });
setTimeout(()=>{ if(!overlay.classList.contains('is-hidden')){ overlay.classList.add('is-hidden'); if(!isOn) powerBtn.click(); } },15000);

// ===== Módulos / Gauges =====
const grid=document.getElementById('grid');
const MODULES=[
  { id:'oxigeno',        title:'Oxígeno — Saturación O₂', target:97 },
  { id:'hidratacion',    title:'Hidratación — Ingesta diaria', target:88 },
  { id:'energia',        title:'Energía — Metabolismo', target:90 },
  { id:'neuro',          title:'Neurotransmisores — Balance general', target:85 },
  { id:'inmunidad',      title:'Sistema inmune', target:92 },
  { id:'estructura',     title:'Estructuras — Músculo & Hueso', target:89 },
];
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function toAngle(v){return -120 + (clamp(v,0,100)*2.4);}
function setStatus(card,text,level){ const dot=card.querySelector('.dot'); const st=card.querySelector('.status span'); if(dot) dot.className='dot '+level; if(st) st.textContent=text; }
function setVisual(card,v,active){
  const needle=card.querySelector('.needle'), value=card.querySelector('.value');
  card.dataset.current=v; if(needle) needle.style.transform=`rotate(${toAngle(v)}deg)`; if(value) value.textContent=`${Math.round(v)}%`;
  if(v<40) setStatus(card,active?'Calibrando':'En espera','bad');
  else if(v<75) setStatus(card,active?'Calibrando':'Ajustando','warn');
  else setStatus(card,'Estable','good');
}
function animateTo(card,goal){
  clearInterval(card._timer);
  card._timer=setInterval(()=>{
    let cur=Number(card.dataset.current||0);
    cur+=(goal-cur)*0.10+0.6;
    if(Math.abs(goal-cur)<0.6){cur=goal; setVisual(card,cur,true); clearInterval(card._timer); card._active=false;}
    else setVisual(card,cur,true);
  },100);
}
function createCard(mod){
  const card=document.createElement('section'); card.className='card';
  const title=document.createElement('div'); title.className='title-sm'; title.textContent=mod.title;
  const status=document.createElement('div'); status.className='status'; const dot=document.createElement('i'); dot.className='dot bad'; const stText=document.createElement('span'); stText.textContent='En espera'; status.append(dot,stText);

  const gauge=document.createElement('div'); gauge.className='gauge';
  const dial=document.createElement('div'); dial.className='dial';
  const needle=document.createElement('div'); needle.className='needle'; needle.style.transform=`rotate(${toAngle(0)}deg)`;
  const hub=document.createElement('div'); hub.className='hub';
  const value=document.createElement('div'); value.className='value'; value.textContent='0%';
  gauge.append(dial,needle,hub,value);

  const controls=document.createElement('div'); controls.className='controls';
  const bStart=document.createElement('button'); bStart.className='btn mod'; bStart.textContent='Activar';
  const bStop=document.createElement('button'); bStop.className='btn alt mod'; bStop.textContent='Detener';
  controls.append(bStart,bStop);

  card.append(title,status,gauge,controls);
  card._timer=null; card._active=false; card.dataset.current=0;
  const goal=clamp(mod.target??92,70,100);

  function start(){ if(!isOn||card._active) return; card._active=true; animateTo(card,goal); playBeep(); gauge.classList.add('neon'); }
  function stop(){ gauge.classList.remove('neon'); clearInterval(card._timer); card._active=false;
    card._timer=setInterval(()=>{ let cur=Number(card.dataset.current||10); cur-=Math.max(0.8,(cur-10)*0.06);
      if(cur<=10){cur=10; setVisual(card,cur,false); clearInterval(card._timer);} else setVisual(card,cur,false);
    },90);
  }
  bStart.addEventListener('click',start); bStop.addEventListener('click',stop);
  bStart.disabled=true; bStop.disabled=true;
  return card;
}
MODULES.forEach(m=>grid.appendChild(createCard(m)));
function toggleModules(on){
  document.querySelectorAll('.card').forEach(card=>{
    card.querySelectorAll('.btn.mod').forEach(b=> b.disabled=!on);
    if(!on){ clearInterval(card._timer); setVisual(card,0,false); setStatus(card,'En espera','bad'); card._active=false; card.querySelector('.gauge')?.classList.remove('neon'); }
  });
}

// ===== Checklist + Ticker =====
const CHECKS=[
  { id:'scan',label:'Escaneo sistémico' },
  { id:'torrente',label:'Recuento en torrente sanguíneo' },
  { id:'operativos',label:'Nanorobots operativos' },
  { id:'autorreparacion',label:'Autorreparación celular' },
  { id:'depuracion',label:'Depuración de toxinas' },
];
const checklist=document.getElementById('checklist');
CHECKS.forEach(ch=>{
  const row=document.createElement('div'); row.className='row';
  const head=document.createElement('div'); head.className='row-head';
  const label=document.createElement('div'); label.textContent=ch.label;
  const perc=document.createElement('div'); perc.className='perc'; perc.id=`p-${ch.id}`; perc.textContent='0%';
  head.append(label,perc);
  const bar=document.createElement('div'); bar.className='bar';
  const fill=document.createElement('div'); fill.className='fill'; fill.id=`b-${ch.id}`;
  bar.append(fill); row.append(head,bar); checklist?.appendChild(row);
});
const CHECK_STATE={};
function renderSysTicker(){
  const track=document.getElementById('sys-ticker-track'); if(!track) return;
  const parts=CHECKS.map(ch=>{
    const pct=Math.round(CHECK_STATE[ch.id]??0);
    const cls=pct>70?'nb-pos':(pct>40?'nb-warn':'nb-neg');
    return `<span class="nb-item"><span>${ch.label}:</span> <strong class="${cls}">${pct}%</strong></span>`;
  });
  track.innerHTML = parts.join('<span class="nb-sep">•</span>') + '<span class="nb-sep">•</span>' + parts.join('<span class="nb-sep">•</span>');
}
function setCheck(id,pct){
  pct=Math.max(0,Math.min(100,pct));
  const f=document.getElementById(`b-${id}`), p=document.getElementById(`p-${id}`);
  if(f) f.style.transform=`scaleX(${pct/100})`;
  if(p){ const color=pct>70?'#00ff66':(pct>40?'#ffe600':'#ff2a2a'); p.style.color=color; p.textContent=Math.round(pct)+'%'; }
  CHECK_STATE[id]=pct; renderSysTicker();
}
document.getElementById('startBtn').addEventListener('click',()=>{
  setCheck('scan',28); setCheck('torrente',84); setCheck('operativos',92); setCheck('autorreparacion',31); setCheck('depuracion',47);
});
setTimeout(()=>{ if(!overlay.classList.contains('is-hidden')){ setCheck('scan',10); setCheck('torrente',20); setCheck('operativos',25); setCheck('autorreparacion',8); setCheck('depuracion',12); } else { renderSysTicker(); } },1500);

// ===== KPIs superiores (simulación) =====
function rndRange(min,max){return Math.round(min+(max-min)*Math.random());}
function updateKPIs(){
  const vital = rndRange(82,97), mind=rndRange(75,95), structure=rndRange(78,93), recovery=rndRange(70,92);
  const set=(id,val)=>{ const el=document.getElementById(id); if(el) el.innerHTML=el.textContent.split(':')[0]+`: <b>${val}%</b>`; };
  set('kpi-vital', vital); set('kpi-mind', mind); set('kpi-structure', structure); set('kpi-recovery', recovery);
}
setInterval(updateKPIs, 2200);

// ===== Init =====
(function init(){
  document.getElementById('patient-name').textContent = patientName;
  initWelcome();
  const now=new Date(); biorr(now); renderHeaderInfo(now); renderAge(); updateKPIs();
  // reloj de edad/bio cada segundo
  setInterval(()=>{ const t=new Date(); biorr(t); renderHeaderInfo(t); renderAge(); }, 1000);
})();
