/* =========================
   CONFIG / PACIENTE / UTIL
========================= */
const patientName='Jonathan Fumero Mesa';
function makeLocalDate(y,m,d,hh,mm){const dt=new Date(Date.UTC(y,m-1,d,hh,mm));return new Date(dt.getTime()-3*3600*1000);}
const birth=makeLocalDate(1976,12,4,0,50);
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

/* =========================
   FX FONDO (torrente)
========================= */
class BloodstreamFX{
  constructor(id){this.canvas=document.getElementById(id);this.ctx=this.canvas?.getContext('2d')||null;this.pxRatio=Math.max(1,Math.min(2,window.devicePixelRatio||1));this.running=false;this.particles=[];this.cells=[];this.t=0;this.reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches??false;this.resize=this.resize.bind(this);this.loop=this.loop.bind(this);if(this.canvas&&this.ctx){addEventListener('resize',this.resize,{passive:true});this.resize();this.init();}}
  resize(){const{innerWidth:w,innerHeight:h}=window;this.canvas.width=Math.floor(w*this.pxRatio);this.canvas.height=Math.floor(h*this.pxRatio);Object.assign(this.canvas.style,{width:w+'px',height:h+'px'});}
  init(){const W=this.canvas.width,H=this.canvas.height;const isPhone=matchMedia?.('(max-width:520px)')?.matches??false;const bots=this.reduceMotion?50:(isPhone?90:120);const cells=this.reduceMotion?12:(isPhone?22:30);
    this.particles=Array.from({length:bots},()=>({x:Math.random()*W,y:Math.random()*H,vx:(0.3+Math.random()*0.7)*this.pxRatio,amp:8+Math.random()*14,phase:Math.random()*Math.PI*2,r:0.4+Math.random()*1.0}));
    this.cells=Array.from({length:cells},()=>({x:Math.random()*W,y:Math.random()*H,vx:(0.15+Math.random()*0.4)*this.pxRatio,amp:6+Math.random()*10,phase:Math.random()*Math.PI*2,r:1.5+Math.random()*1.5}));
  }
  start(){if(!this.ctx||this.running)return;this.running=true;this.t=performance.now();requestAnimationFrame(this.loop);}
  stop(){if(!this.ctx)return;this.running=false;this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);}
  loop(now){if(!this.running||!this.ctx)return;const{ctx,canvas}=this;const W=canvas.width,H=canvas.height;const dt=(now-this.t)/1000;this.t=now;
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0b0a12');g.addColorStop(1,'#110b15');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.lineWidth=8*this.pxRatio;ctx.strokeStyle='rgba(255,120,160,.08)';
    for(let i=0;i<3;i++){const y=(H/4)*(i+1)+Math.sin(now/900+i)*4*this.pxRatio;ctx.beginPath();ctx.moveTo(0,y);for(let x=0;x<=W;x+=50*this.pxRatio){ctx.lineTo(x,y+Math.sin((x+now/5)/60+i)*2*this.pxRatio);}ctx.stroke();}
    for(const c of this.cells){ctx.fillStyle='rgba(240,90,126,0.7)';ctx.beginPath();ctx.arc(c.x,c.y,c.r*this.pxRatio,0,Math.PI*2);ctx.fill();c.x+=c.vx;c.y+=Math.sin((c.x+now/20)/60)*(0.3*this.pxRatio);if(c.x>W+10){c.x=-10;c.y=Math.random()*H;}}
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(const p of this.particles){const y=p.y+Math.sin(p.phase+now/600)*p.amp,r=p.r*this.pxRatio;const rr=ctx.createRadialGradient(p.x,y,0,p.x,y,r*5);rr.addColorStop(0,'rgba(90,209,255,.20)');rr.addColorStop(1,'rgba(90,209,255,0)');ctx.fillStyle=rr;ctx.beginPath();ctx.arc(p.x,y,r*5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#5ad1ff';ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(p.x,y,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;p.x+=p.vx*(1+Math.sin(now/1200)*.04);p.phase+=dt;if(p.x>W+10){p.x=-10;p.y=Math.random()*H;}}
    ctx.restore();requestAnimationFrame(this.loop);
  }
}

/* =========================
   EDAD Y BIO / OVERLAY
========================= */
function ageTextDetailed(now=new Date()){let y=now.getFullYear()-birth.getFullYear();let m=now.getMonth()-birth.getMonth();let d=now.getDate()-birth.getDate();let H=now.getHours()-birth.getHours();let Mi=now.getMinutes()-birth.getMinutes();let S=now.getSeconds()-birth.getSeconds();if(S<0){S+=60;Mi--}if(Mi<0){Mi+=60;H--}if(H<0){H+=24;d--}if(d<0){const prev=new Date(now.getFullYear(),now.getMonth(),0).getDate();d+=prev;m--}if(m<0){m+=12;y--}const s=(n,a,b)=>`${n} ${n===1?a:b}`;return`${s(y,'año','años')} ${s(m,'mes','meses')} ${s(d,'día','días')} ${s(H,'hora','horas')} ${s(Mi,'minuto','minutos')} ${s(S,'segundo','segundos')}`;}
function renderAge(){const full=ageTextDetailed(new Date());const a1=document.getElementById('age');if(a1)a1.textContent=full;const meta=document.getElementById('project-meta');if(meta)meta.innerHTML=`Paciente: <b>${patientName}</b> · Edad: ${full}`;}
const CHINESE=['Rata','Buey','Tigre','Conejo','Dragón','Serpiente','Caballo','Cabra','Mono','Gallo','Perro','Cerdo'];
function zodiac(d){const m=d.getMonth()+1,day=d.getDate();if((m==3&&day>=21)||(m==4&&day<=19))return'Aries ♈';if((m==4&&day>=20)||(m==5&&day<=20))return'Tauro ♉';if((m==5&&day>=21)||(m==6&&day<=20))return'Géminis ♊';if((m==6&&day>=21)||(m==7&&day<=22))return'Cáncer ♋';if((m==7&&day>=23)||(m==8&&day<=22))return'Leo ♌';if((m==8&&day>=23)||(m==9&&day<=22))return'Virgo ♍';if((m==9&&day>=23)||(m==10&&day<=22))return'Libra ♎';if((m==10&&day>=23)||(m==11&&day<=21))return'Escorpio ♏';if((m==11&&day>=22)||(m==12&&day<=21))return'Sagitario ♐';if((m==12&&day>=22)||(m==1&&day<=19))return'Capricornio ♑';if((m==1&&day>=20)||(m==2&&day<=18))return'Acuario ♒';return'Piscis ♓';}
function chinese(y){return CHINESE[(y-1900)%12];}
function moon(d){const syn=29.530588853,ref=new Date(Date.UTC(2000,0,6,18,14)),days=(d-ref)/86400000,age=((days%syn)+syn)%syn;if(age<1.84566)return'Luna nueva 🌑';if(age<5.53699)return'Creciente visible 🌒';if(age<9.22831)return'Cuarto creciente 🌓';if(age<12.91963)return'Gibosa creciente 🌔';if(age<16.61096)return'Luna llena 🌕';if(age<20.30228)return'Gibosa menguante 🌖';if(age<23.99361)return'Cuarto menguante 🌗';return'Creciente menguante 🌘';}
function circadian(d){const h=d.getHours()+d.getMinutes()/60;if(h>=22||h<6)return'Sueño / recuperación';if(h<9)return'Activación matinal';if(h<12)return'Alerta alta';if(h<14)return'Bajada posalmuerzo';if(h<18)return'Segundo pico de energía';return'Desaceleración vespertina';}
function biorr(d){const birthRef=new Date(birth.getFullYear(),birth.getMonth(),birth.getDate());const days=Math.floor((new Date(d.getFullYear(),d.getMonth(),d.getDate())-birthRef)/86400000);const renderBio=(id,label,period,emoji)=>{const pct=Math.round(Math.sin(2*Math.PI*days/period)*100);const cls=pct>3?'bio-pos':(pct<-3?'bio-neg':'bio-neu');const sign=pct>0?'+':'';const el=document.getElementById(id);if(el)el.innerHTML=`${label}: <span class="bio-val ${cls}">${sign}${pct}%</span> ${emoji}`;};renderBio('ov-bio-f','Físico',23,'💪');renderBio('ov-bio-e','Emocional',28,'💖');renderBio('ov-bio-i','Intelectual',33,'🧠');const cz=chinese(1976);const czTxt='Chino: '+cz+(cz==='Dragón'?' 🐉':'');const ovZ=document.getElementById('ov-zodiac');if(ovZ)ovZ.textContent='Zodiaco: '+zodiac(new Date(1976,11,4));const ovC=document.getElementById('ov-czodiac');if(ovC)ovC.textContent=czTxt;const ovM=document.getElementById('ov-moon');if(ovM)ovM.textContent='Luna: '+moon(d);const ovCi=document.getElementById('ov-circ');if(ovCi)ovCi.textContent='Circadiano: '+circadian(d);}

/* =========================
   AUDIO
========================= */
let audioCtx=null,masterGain=null,humOsc=null,humGain=null,soundOn=true;
function ensureAudio(){if(audioCtx)return;audioCtx=new(window.AudioContext||window.webkitAudioContext)();masterGain=audioCtx.createGain();masterGain.gain.value=0.0009;masterGain.connect(audioCtx.destination);}
function playBeep(){if(!audioCtx||!soundOn)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=880;g.gain.value=0.001;o.connect(g).connect(masterGain);o.start();g.gain.exponentialRampToValueAtTime(0.00001,audioCtx.currentTime+0.12);o.stop(audioCtx.currentTime+0.14);}
function startHum(){if(!audioCtx||humOsc||!soundOn)return;humOsc=audioCtx.createOscillator();humGain=audioCtx.createGain();humOsc.type='sawtooth';humOsc.frequency.value=110;humGain.gain.value=0.0005;humOsc.connect(humGain).connect(masterGain);humOsc.start();}
function stopHum(){if(!humOsc)return;humGain.gain.exponentialRampToValueAtTime(0.00001,audioCtx.currentTime+0.2);humOsc.stop(audioCtx.currentTime+0.25);humOsc=null;humGain=null;}

/* =========================
   OVERLAY / POWER
========================= */
function animateCounter(el,to,ms=3200){const start=0,t0=performance.now();function step(t){const k=Math.min(1,(t-t0)/ms),e=.5-.5*Math.cos(Math.PI*k);el.textContent=Math.round(start+(to-start)*e).toLocaleString('es-UY');if(k<1)requestAnimationFrame(step);}requestAnimationFrame(step);}
function initWelcome(){const base=12_000_000,ops=Math.floor(base*(0.90+Math.random()*0.06));animateCounter(document.getElementById('n-total'),base,3200);animateCounter(document.getElementById('n-op'),ops,3400);const tb=document.getElementById('swarm-total-bar');if(tb)tb.style.width='100%';setTimeout(()=>{const sb=document.getElementById('swarm-bar');if(sb)sb.style.width=Math.round(ops/base*100)+'%';},700);}

/* =========================
   MENÚ / VISTAS (resumen)
========================= */
const MODEL_ROOT=[
  { id:'entradas',  num:'1', title:'Entradas Básicas', desc:'Agua, Oxígeno, Energía, Micronutrientes' },
  { id:'regulacion',num:'2', title:'Sistemas de Regulación', desc:'Neurotransmisores y Hormonas' },
  { id:'soporte',   num:'3', title:'Sistemas de Soporte', desc:'Inmune, Microbiota, Sistema Eléctrico, Estructuras' },
  { id:'estilo',    num:'4', title:'Estilo de Vida', desc:'Movimiento, Sueño, Emociones, Conexión' },
  { id:'habitos',   num:'5', title:'Hábitos y Ambiente', desc:'Alimentación, Hidratación, Sol, Aire, Higiene' },
  { id:'nucleo',    num:'6', title:'Núcleo Celular', desc:'Integridad, Renovación y Longevidad' },
];

const MODEL={
  entradas:[
    { id:'agua', title:'Agua' },
    { id:'oxigeno', title:'Oxígeno' },
    { id:'energia', title:'Energía', subs:['Carbohidratos','Grasas saludables','Proteínas'] },
    { id:'micros', title:'Micronutrientes', subs:['Minerales: Na, K, Ca, Mg, Fe, Zn, Cu, I, Se','Vitaminas: A, D, E, K, C, B1-B12'] },
  ],
  regulacion:[
    { id:'neuro', title:'Neurotransmisores', subs:['Dopamina','Serotonina','GABA','Glutamato','Acetilcolina'] },
    { id:'hormonas', title:'Hormonas', subs:['Insulina, Glucagón, T3/T4, GH','Cortisol, Melatonina','Testosterona, Estrógeno, Progesterona','Leptina, Grelina'] },
  ],
  soporte:[
    { id:'inmune', title:'Sistema Inmune' },
    { id:'microbiota', title:'Microbiota intestinal' },
    { id:'electrico', title:'Sistema Eléctrico', subs:['Na⁺','K⁺','Ca²⁺'] },
    { id:'estructura', title:'Estructuras Físicas', subs:['Músculos','Huesos','Tejido conectivo'] },
  ],
  estilo:[
    { id:'movimiento', title:'Movimiento físico' },
    { id:'sueno', title:'Sueño / Ritmos circadianos' },
    { id:'emocion', title:'Gestión emocional y estrés' },
    { id:'conexion', title:'Conexión social y mental' },
  ],
  habitos:[
    { id:'alimentacion', title:'Alimentación equilibrada' },
    { id:'hidratacion', title:'Hidratación suficiente' },
    { id:'sol', title:'Exposición solar' },
    { id:'aire', title:'Aire limpio / respiración' },
    { id:'higiene', title:'Higiene y prevención médica' },
  ],
  nucleo:[
    { id:'integridad', title:'Integridad celular', subs:['Salud del ADN','Reparación celular'] },
    { id:'renovacion', title:'Renovación celular', subs:['Médula ósea','Células madre'] },
    { id:'longevidad', title:'Longevidad celular', subs:['Telómeros','Autofagia'] },
  ],
};

const app=document.getElementById('app');
const crumbCat=document.getElementById('crumb-cat');
const crumbSub=document.getElementById('crumb-sub');
document.querySelector('.crumb[data-level="root"]').onclick=()=>renderRoot();

function clearCrumbs(){crumbCat.textContent='';crumbSub.textContent='';}
function setCatCrumb(t){crumbCat.textContent=t;crumbSub.textContent='';}
function setSubCrumb(t){crumbSub.textContent=t;}

function renderRoot(){
  clearCrumbs(); app.innerHTML='';
  const grid=document.createElement('div'); grid.className='grid-categories';
  MODEL_ROOT.forEach(cat=>{
    const el=document.createElement('div'); el.className='cat'; el.onclick=()=>renderSubmenu(cat.id,cat.title);
    el.innerHTML=`<div class="num">${cat.num}</div><div class="title">${cat.title}</div><div class="desc">${cat.desc||''}</div>`;
    grid.appendChild(el);
  });
  app.appendChild(grid);
}
function renderSubmenu(catId,catTitle){
  setCatCrumb(catTitle); app.innerHTML='';
  const grid=document.createElement('div'); grid.className='grid-sub';
  (MODEL[catId]||[]).forEach(item=>{
    const el=document.createElement('div'); el.className='sub'; el.onclick=()=>renderContent(catId,item.id,item.title);
    el.innerHTML=`<div class="title">${item.title}</div>${item.subs?`<div class="hint">${item.subs.join(' · ')}</div>`:''}`;
    grid.appendChild(el);
  });
  app.appendChild(grid);
}
function createGaugeCard(title,target=90){
  const wrap=document.createElement('section'); wrap.className='card';
  wrap.innerHTML=`<div class="title-sm">${title}</div><div class="status"><i class="dot good"></i><span>Estable</span></div><div class="gauge"><div class="dial"></div><div class="needle"></div><div class="hub"></div><div class="value">${target}%</div></div>`;
  // posiciona aguja
  const needle=wrap.querySelector('.needle'); const toAngle=v=>-120+(clamp(v,0,100)*2.4);
  needle.style.transform=`rotate(${toAngle(target)}deg)`; return wrap;
}
function createMiniMeter(label,value){
  const el=document.createElement('div'); el.className='meter';
  el.innerHTML=`<div class="label"><span>${label}</span><b class="perc">${value}%</b></div><div class="line"><div class="fill" style="transform:scaleX(${value/100})"></div></div>`;
  return el;
}
function renderContent(catId,subId,subTitle){
  setSubCrumb(subTitle); app.innerHTML='';
  const grid=document.createElement('div'); grid.className='grid-panels';
  switch(subId){
    case 'agua': grid.appendChild(createGaugeCard('Hidratación — Ingesta',88)); grid.appendChild(createMiniMeter('Meta 2 L',90)); break;
    case 'oxigeno': grid.appendChild(createGaugeCard('Saturación O₂',97)); grid.appendChild(createMiniMeter('Respiración',76)); break;
    case 'energia': grid.appendChild(createGaugeCard('Energía — Metabolismo',90)); ['Carbohidratos', 'Grasas saludables','Proteínas'].forEach((x,i)=>grid.appendChild(createMiniMeter(x,70+i*6))); break;
    case 'micros': ['Na','K','Ca','Mg','Fe','Zn','Cu','I','Se','A','D','E','K','C','B1','B2','B3','B6','B9','B12'].forEach(sym=>grid.appendChild(createMiniMeter(sym,60+Math.round(Math.random()*35)))); break;
    case 'neuro': ['Dopamina','Serotonina','GABA','Glutamato','Acetilcolina'].forEach(n=>grid.appendChild(createMiniMeter(n,65+Math.round(Math.random()*30)))); grid.appendChild(createGaugeCard('Balance mental',85)); break;
    case 'hormonas': ['Insulina','Glucagón','T3/T4','GH','Cortisol','Melatonina','Testosterona','Estrógeno','Progesterona','Leptina','Grelina'].forEach(h=>grid.appendChild(createMiniMeter(h,60+Math.round(Math.random()*35)))); break;
    case 'inmune': grid.appendChild(createGaugeCard('Estatus inmune',92)); ['Leucocitos','Inflamación','Vitamina D','Zinc'].forEach(x=>grid.appendChild(createMiniMeter(x,65+Math.round(Math.random()*25)))); break;
    case 'microbiota': grid.appendChild(createGaugeCard('Diversidad microbiana',86)); ['Fibra','Probióticos','Prebióticos'].forEach(x=>grid.appendChild(createMiniMeter(x,60+Math.round(Math.random()*30)))); break;
    case 'electrico': ['Na⁺','K⁺','Ca²⁺'].forEach(e=>grid.appendChild(createMiniMeter(e,70+Math.round(Math.random()*25)))); grid.appendChild(createGaugeCard('Conducción nerviosa',88)); break;
    case 'estructura': grid.appendChild(createGaugeCard('Músculo',89)); grid.appendChild(createGaugeCard('Hueso',87)); grid.appendChild(createGaugeCard('Tejido conectivo',84)); break;
    case 'movimiento': grid.appendChild(createGaugeCard('Cardio semanal',78)); grid.appendChild(createGaugeCard('Fuerza semanal',81)); break;
    case 'sueno': grid.appendChild(createGaugeCard('Sueño / Ritmo',82)); ['Duración','Regularidad','Profundidad'].forEach(s=>grid.appendChild(createMiniMeter(s,70+Math.round(Math.random()*20)))); break;
    case 'emocion': ['Estrés','Ánimo','Relajación'].forEach(s=>grid.appendChild(createMiniMeter(s,60+Math.round(Math.random()*35)))); break;
    case 'conexion': ['Vínculos','Actividades','Propósito'].forEach(s=>grid.appendChild(createMiniMeter(s,62+Math.round(Math.random()*30)))); break;
    case 'alimentacion': ['Calidad','Balance','Regularidad'].forEach(s=>grid.appendChild(createMiniMeter(s,68+Math.round(Math.random()*26)))); break;
    case 'hidratacion': grid.appendChild(createGaugeCard('Hidratación — Hábito',86)); ['Litros/día','Electrolitos','Sensación de sed'].forEach(s=>grid.appendChild(createMiniMeter(s,65+Math.round(Math.random()*25)))); break;
    case 'sol': ['Vitamina D','Ritmo circadiano','Exposición segura'].forEach(s=>grid.appendChild(createMiniMeter(s,60+Math.round(Math.random()*35)))); break;
    case 'aire': ['Calidad del aire','Respiración nasal','Ventilación'].forEach(s=>grid.appendChild(createMiniMeter(s,64+Math.round(Math.random()*28)))); break;
    case 'higiene': ['Prevención','Controles','Hábitos diarios'].forEach(s=>grid.appendChild(createMiniMeter(s,70+Math.round(Math.random()*25)))); break;
    case 'integridad': ['Salud del ADN','Reparación celular'].forEach(s=>grid.appendChild(createMiniMeter(s,72+Math.round(Math.random()*22)))); break;
    case 'renovacion': ['Médula ósea','Células madre'].forEach(s=>grid.appendChild(createMiniMeter(s,68+Math.round(Math.random()*24)))); break;
    case 'longevidad': ['Telómeros','Autofagia'].forEach(s=>grid.appendChild(createMiniMeter(s,66+Math.round(Math.random()*26)))); break;
    default: grid.appendChild(createGaugeCard(subTitle,80));
  }
  app.appendChild(grid); playBeep();
}

/* =========================
   TICKER + CHECKLIST
========================= */
const CHECKS=[{id:'scan',label:'Escaneo sistémico'},{id:'torrente',label:'Recuento en torrente sanguíneo'},{id:'operativos',label:'Nanorobots operativos'},{id:'autorreparacion',label:'Autorreparación celular'},{id:'depuracion',label:'Depuración de toxinas'}];
const CHECK_STATE={};
const checklist=document.getElementById('checklist');
function buildChecklist(){checklist.innerHTML='';CHECKS.forEach(ch=>{const row=document.createElement('div');row.className='row';const head=document.createElement('div');head.className='row-head';const label=document.createElement('div');label.textContent=ch.label;const perc=document.createElement('div');perc.className='perc';perc.id=`p-${ch.id}`;perc.textContent='0%';const bar=document.createElement('div');bar.className='bar';const fill=document.createElement('div');fill.className='fill';fill.id=`b-${ch.id}`;head.append(label,perc);bar.append(fill);row.append(head,bar);checklist.appendChild(row);});}
function renderSysTicker(){const track=document.getElementById('sys-ticker-track');if(!track)return;const parts=CHECKS.map(ch=>{const pct=Math.round(CHECK_STATE[ch.id]??0);const cls=pct>70?'nb-pos':(pct>40?'nb-warn':'nb-neg');return `<span class="nb-item"><span>${ch.label}:</span> <strong class="${cls}">${pct}%</strong></span>`;});track.innerHTML=parts.join('<span class="nb-sep">•</span>')+'<span class="nb-sep">•</span>'+parts.join('<span class="nb-sep">•</span>');}
function setCheck(id,pct){pct=clamp(pct,0,100);const f=document.getElementById(`b-${id}`),p=document.getElementById(`p-${id}`);if(f)f.style.transform=`scaleX(${pct/100})`;if(p){const color=pct>70?'#00ff66':(pct>40?'#ffe600':'#ff2a2a');p.style.color=color;p.textContent=Math.round(pct)+'%';}CHECK_STATE[id]=pct;renderSysTicker();}

/* =========================
   OPTIMIZADOR SECUENCIAL
========================= */
/* Cola completa en el orden que pediste */
const OPT_QUEUE = [
  // 1. Entradas
  'Agua','Oxígeno','Carbohidratos','Grasas saludables','Proteínas',
  'Minerales: Na, K, Ca, Mg, Fe, Zn, Cu, I, Se',
  'Vitaminas: A, D, E, K, C, complejo B (B1, B2, B3, B6, B9, B12)',
  // 2. Regulación
  'Dopamina','Serotonina','GABA','Glutamato','Acetilcolina',
  'Insulina','Glucagón','T3/T4','GH','Cortisol','Melatonina','Testosterona','Estrógeno','Progesterona','Leptina','Grelina',
  // 3. Soporte
  'Sistema Inmune','Microbiota intestinal','Sodio (Na⁺)','Potasio (K⁺)','Calcio (Ca²⁺)','Músculos','Huesos','Tejido conectivo',
  // 4. Estilo de vida
  'Movimiento físico','Sueño / Ritmos circadianos','Gestión emocional y estrés','Conexión social y mental',
  // 5. Hábitos y ambiente
  'Alimentación equilibrada','Hidratación suficiente','Exposición solar','Aire limpio / respiración adecuada','Higiene y prevención médica',
  // 6. Núcleo celular
  'Salud del ADN','Reparación celular (enzimas)', 'Médula ósea','Células madre','Telómeros','Autofagia'
];

const optPanel = document.getElementById('optimizer');
const optList  = document.getElementById('opt-list');
const optBtn   = document.getElementById('opt-btn');
const optCancel= document.getElementById('opt-cancel');
let   optRunning = false;
let   optAbort   = null;

function createOptItem(name, fromPct, toPct){
  const item=document.createElement('div'); item.className='opt-item';
  item.innerHTML = `
    <div class="opt-row">
      <div class="opt-name">${name}</div>
      <div class="opt-diff"><span>${fromPct}%</span> ⟶ <strong>${toPct}%</strong></div>
    </div>
    <div class="opt-bar"><div class="opt-fill" style="transform:scaleX(${fromPct/100})"></div></div>
  `;
  return item;
}

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

async function runOptimizer(){
  if(optRunning) return;
  optRunning = true;
  optAbort = new AbortController();
  optList.innerHTML='';
  optPanel.classList.remove('hidden');
  optBtn.disabled = true;

  // animación por ítem
  for(const name of OPT_QUEUE){
    if(optAbort.signal.aborted) break;

    // valores aleatorios “bajos” y “óptimos”
    const from = Math.max(10, Math.round(30 + Math.random()*25)); // 30–55%
    const to   = Math.min(100, Math.round(85 + Math.random()*12)); // 85–97%

    const row = createOptItem(name, from, to);
    optList.prepend(row); // aparece arriba

    // animar barra del from -> to
    await sleep(150);
    const fill = row.querySelector('.opt-fill');
    fill.style.transform = `scaleX(${to/100})`;

    // actualizar ticker global con un “eco” (opcional)
    // elegimos uno a uno pseudo-azar para dar sensación sistémica
    const keys = ['scan','torrente','operativos','autorreparacion','depuracion'];
    const k = keys[Math.floor(Math.random()*keys.length)];
    setCheck(k, Math.round(60 + Math.random()*40));

    // esperar y borrar
    await sleep(900);
    row.classList.add('removing');
    await sleep(400);
    row.remove();
  }

  // fin
  optPanel.classList.add('hidden');
  optRunning = false;
  optBtn.disabled = false;
}

optBtn?.addEventListener('click', async ()=>{
  playBeep();
  await runOptimizer();
});

optCancel?.addEventListener('click', ()=>{
  if(!optRunning) { optPanel.classList.add('hidden'); return; }
  optAbort.abort();
});

/* =========================
   POWER / EVENTOS
========================= */
const overlay=document.getElementById('overlay');
const startBtn=document.getElementById('startBtn');
const powerBtn=document.getElementById('power-btn');
const led=document.getElementById('led');
const soundBtn=document.getElementById('sound-btn');
const fx=new BloodstreamFX('fx-bloodstream');

if(soundBtn){
  soundBtn.addEventListener('click', async ()=>{
    ensureAudio();try{await audioCtx.resume();}catch{}
    soundOn=!soundOn;
    soundBtn.textContent='Sonido: '+(soundOn?'ON':'OFF');
    soundBtn.setAttribute('aria-pressed',String(soundOn));
    if(isOn&&soundOn)startHum();else stopHum();
  });
}

let isOn=false;
startBtn.onclick=async()=>{
  overlay.classList.add('is-hidden');
  ensureAudio(); try{await audioCtx.resume();}catch{}
  if(!isOn) powerBtn.click();
  if(soundOn) startHum();
  fx.start();
};

powerBtn.onclick=()=>{
  isOn=!isOn;
  powerBtn.textContent=isOn?'Apagar':'Encender';
  led.classList.toggle('on',isOn);
  if(!audioCtx) return;
  if(isOn&&soundOn) startHum(); else stopHum();
  if(isOn) fx.start(); else fx.stop();
};

document.addEventListener('visibilitychange',()=>{if(document.hidden)fx.stop();else if(isOn)fx.start();});

/* =========================
   INIT
========================= */
(function init(){
  document.getElementById('patient-name').textContent=patientName;
  initWelcome(); const now=new Date(); biorr(now); renderAge();
  setInterval(()=>{const t=new Date(); biorr(t); renderAge();},1000);

  renderRoot(); // menú principal
  buildChecklist();

  // checklist por defecto
  setTimeout(()=>{ if(!overlay.classList.contains('is-hidden')){ setCheck('scan',10);setCheck('torrente',20);setCheck('operativos',25);setCheck('autorreparacion',8);setCheck('depuracion',12); } else { setCheck('scan',28);setCheck('torrente',84);setCheck('operativos',92);setCheck('autorreparacion',31);setCheck('depuracion',47); } },1500);
})();
