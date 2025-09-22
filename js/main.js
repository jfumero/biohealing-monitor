// ===========================
// BioHealing Monitor - main.js (versión robusta)
// ===========================

(function(){
  // Esperar DOM listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  function boot(){

    // ---------- Utilidades de fecha/edad ----------
    function makeLocalDate(y,m,d,hh,mm){
      const dt=new Date(Date.UTC(y,m-1,d,hh,mm));
      return new Date(dt.getTime()-3*3600*1000); // Montevideo -03
    }
    const birth = makeLocalDate(1976,12,4,0,50);

    function ageTextCompact(){
      const now=new Date();
      let years = now.getFullYear() - birth.getFullYear();
      const afterBirthday = (now.getMonth()>birth.getMonth()) ||
                            (now.getMonth()==birth.getMonth() && now.getDate()>=birth.getDate());
      if(!afterBirthday) years--;
      return years+" años";
    }
    function renderAge(){
      const txt = ageTextCompact();
      const a1=document.getElementById('age'); if(a1) a1.textContent=txt;
      const a2=document.getElementById('ov-age'); if(a2) a2.textContent='Edad: '+txt;
    }
    setInterval(renderAge,1000); renderAge();

    // ---------- Audio (no bloquea UI si falla) ----------
    let audioCtx=null, masterGain=null, humOsc=null, humGain=null;
    let soundOn=true;

    function ensureAudio(){
      if (audioCtx) return;
      try{
        audioCtx = new (window.AudioContext||window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.06;
        masterGain.connect(audioCtx.destination);
      }catch{ /* navegador que no soporta AudioContext */ }
    }
    async function resumeAudio(){ try{ ensureAudio(); await audioCtx?.resume(); }catch{} }
    document.addEventListener('pointerdown', ()=>{ resumeAudio(); }, {once:true});

    function playBeep(freq=880,dur=0.18){
      if(!audioCtx || !soundOn) return;
      const o=audioCtx.createOscillator(), g=audioCtx.createGain();
      o.type='square'; o.frequency.value=freq; g.gain.value=0.04;
      o.connect(g).connect(masterGain);
      const t0=audioCtx.currentTime; o.start(t0);
      g.gain.exponentialRampToValueAtTime(0.00001, t0+dur);
      o.stop(t0+dur+0.02);
    }
    function startHum(){
      if(!audioCtx || humOsc || !soundOn) return;
      humOsc=audioCtx.createOscillator(); humGain=audioCtx.createGain();
      humOsc.type='sawtooth'; humOsc.frequency.value=220; humGain.gain.value=0.008;
      humOsc.connect(humGain).connect(masterGain); humOsc.start();
    }
    function stopHum(){
      if(!humOsc) return;
      const t=audioCtx.currentTime; humGain.gain.exponentialRampToValueAtTime(0.00001, t+0.2);
      humOsc.stop(t+0.25); humOsc=null; humGain=null;
    }

    // ---------- Bio / astrología en bienvenida ----------
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
    function moon(d){
      const syn=29.530588853,ref=new Date(Date.UTC(2000,0,6,18,14));
      const days=(d-ref)/86400000,age=((days%syn)+syn)%syn;
      if(age<1.84566)return'Luna nueva 🌑';
      if(age<5.53699)return'Creciente visible 🌒';
      if(age<9.22831)return'Cuarto creciente 🌓';
      if(age<12.91963)return'Gibosa creciente 🌔';
      if(age<16.61096)return'Luna llena 🌕';
      if(age<20.30228)return'Gibosa menguante 🌖';
      if(age<23.99361)return'Cuarto menguante 🌗';
      return'Creciente menguante 🌘';
    }
    function circadian(d){
      const h=d.getHours()+d.getMinutes()/60;
      if(h>=22||h<6)return'Sueño / recuperación';
      if(h<9)return'Activación matinal';
      if(h<12)return'Alerta alta';
      if(h<14)return'Bajada posalmuerzo';
      if(h<18)return'Segundo pico de energía';
      return'Desaceleración vespertina';
    }
    function biorr(d){
      const days=Math.floor((new Date(d.getFullYear(),d.getMonth(),d.getDate()) - new Date(birth.getFullYear(),birth.getMonth(),birth.getDate()))/86400000);
      const val=p=>(Math.round(Math.sin(2*Math.PI*days/p)*100))+'%';
      const set=(id,txt)=>{ const el=document.getElementById(id); if(el) el.textContent=txt; };
      set('ov-bio-f','Físico: '+val(23));
      set('ov-bio-e','Emocional: '+val(28));
      set('ov-bio-i','Intelectual: '+val(33));
      set('ov-zodiac','Zodiaco: '+zodiac(new Date(1976,11,4)));
      set('ov-czodiac','Chino: '+chinese(1976));
      set('ov-moon','Luna: '+moon(d));
      set('ov-circ','Circadiano: '+circadian(d));
    }
    biorr(new Date()); setInterval(()=>biorr(new Date()),60000);

    // ---------- Recuento de bienvenida ----------
    function animateCounter(el,to,ms=3200){
      if(!el) return;
      const start=0, t0=performance.now();
      function step(t){
        const k=Math.min(1,(t-t0)/ms);
        const eased=0.5-0.5*Math.cos(Math.PI*k);
        el.textContent=Math.round(start+(to-start)*eased).toLocaleString('es-UY');
        if(k<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    function initWelcome(){
      const base=12_000_000, ops=Math.floor(base*(0.90+Math.random()*0.06));
      const elT=document.getElementById('n-total');
      const elO=document.getElementById('n-op');
      const bar=document.getElementById('swarm-bar');
      animateCounter(elT, base, 3200);
      animateCounter(elO, ops, 3400);
      if(bar) setTimeout(()=>{ bar.style.width=Math.round(ops/base*100)+'%'; }, 700);
    }
    // Correr al cargar y repetir una vez por si la pestaña estaba en bg
    initWelcome();
    setTimeout(initWelcome, 1200);

    // ---------- Power & overlay ----------
    const overlay = document.getElementById('overlay');
    const startBtn = document.getElementById('startBtn');
    const powerBtn = document.getElementById('power-btn');
    const led      = document.getElementById('led');
    const soundBtn = document.getElementById('sound-btn');
    let isOn=false;

    function powerToggle(){
      isOn=!isOn;
      if(powerBtn){ powerBtn.textContent=isOn?'Apagar':'Encender'; }
      if(led){ led.classList.toggle('on', isOn); }
      toggleModules(isOn);
      if(audioCtx){
        if(isOn && soundOn) startHum(); else stopHum();
      }
    }

    if (soundBtn) {
      soundBtn.addEventListener('click', async () => {
        await resumeAudio();
        soundOn = !soundOn;
        soundBtn.textContent = 'Sonido: ' + (soundOn ? 'ON' : 'OFF');
        soundBtn.setAttribute('aria-pressed', String(soundOn));
        if (isOn && soundOn) { startHum(); playBeep(1200, .12); } else { stopHum(); }
      });
    }

    if(startBtn){
      startBtn.addEventListener('click', async ()=>{
        if(overlay) overlay.style.display='none';
        await resumeAudio(); playBeep(880,.18);
        if(!isOn) powerToggle();
      });
    }

    // También cerrar haciendo clic en cualquier parte del overlay
    if(overlay){
      overlay.addEventListener('click', async (e)=>{
        // evitar doble click si fue el botón
        if(e.target.closest('#startBtn')) return;
        overlay.style.display='none';
        await resumeAudio();
        if(!isOn) powerToggle();
      });
    }

    if(powerBtn){
      powerBtn.addEventListener('click', powerToggle);
    }

    // Failsafe 15s
    setTimeout(()=>{
      if(overlay && overlay.style.display!=='none'){
        overlay.style.display='none';
        if(!isOn) powerToggle();
      }
    },15000);

    // ---------- Gauges ----------
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

    function buildTicks(){
      const wrap=document.createElement('div'); wrap.className='ticks';
      const pctToDeg = p => -120 + (p*2.4);
      for(let p=5;p<100;p+=5){
        if(p%10===0) continue;
        const t=document.createElement('div'); t.className='tick';
        t.style.transform=`rotate(${pctToDeg(p)}deg) translateY(-78%)`;
        wrap.appendChild(t);
      }
      for(let p=0;p<=100;p+=10){
        const deg=pctToDeg(p);
        const t=document.createElement('div'); t.className='tick major';
        t.style.transform=`rotate(${deg}deg) translateY(-78%)`;
        wrap.appendChild(t);
        const lbl=document.createElement('div'); lbl.className='tick-label'; lbl.textContent=String(p);
        lbl.style.transform=`rotate(${deg}deg) translateY(-86%) rotate(${-deg}deg)`;
        wrap.appendChild(lbl);
      }
      return wrap;
    }

    function setStatus(card,text,level){
      const dot=card.querySelector('.dot'), st=card.querySelector('.status span');
      if(dot) dot.className='dot '+level; if(st) st.textContent=text;
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
    function animateTo(card,goal){
      clearInterval(card._timer);
      card._timer=setInterval(()=>{
        let cur=Number(card.dataset.current||0);
        cur += (goal-cur)*0.10 + 0.6;
        if(Math.abs(goal-cur)<0.6){cur=goal;setVisual(card,cur,true);clearInterval(card._timer);card._active=false;}
        else setVisual(card,cur,true);
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
      const ticks=buildTicks();

      // inicio aleatorio 35–70
      const init=Math.floor(35+Math.random()*35);

      const needle=document.createElement('div'); needle.className='needle';
      needle.style.transform=`rotate(${toAngle(init)}deg)`;
      const hub=document.createElement('div'); hub.className='hub';
      const value=document.createElement('div'); value.className='value'; value.textContent=init+'%';

      gauge.append(dial, ticks, needle, hub, value);

      const controls=document.createElement('div'); controls.className='controls';
      const bStart=document.createElement('button'); bStart.className='btn mod'; bStart.textContent='Activar';
      const bStop=document.createElement('button'); bStop.className='btn alt mod'; bStop.textContent='Detener';
      controls.append(bStart,bStop);

      card.append(title,status,gauge,controls);

      card._timer=null; card._active=false; card.dataset.current=init;
      setVisual(card, init, false);

      const goal=clamp(mod.target??92,70,100);

      function start(){ if(!isOn||card._active) return; card._active=true; animateTo(card,goal); playBeep(); }
      function stop(){
        clearInterval(card._timer); card._active=false;
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

    const grid=document.getElementById('grid');
    if(grid){ MODULES.forEach(m=> grid.appendChild(createCard(m))); }

    function toggleModules(on){
      document.querySelectorAll('.card').forEach(card=>{
        const btns=card.querySelectorAll('.btn.mod');
        btns.forEach(b=> b.disabled=!on);
        if(!on){ clearInterval(card._timer); setVisual(card,0,false); setStatus(card,'En espera','bad'); card._active=false; }
      });
    }
    window.toggleModules = toggleModules; // por si lo necesitas en consola

    // ---------- Chequeos ----------
    const CHECKS=[
      { id:'scan',label:'Escaneo sistémico' },
      { id:'torrente',label:'Recuento en torrente sanguíneo' },
      { id:'operativos',label:'Nanorobots operativos' },
      { id:'autorreparacion',label:'Autorreparación celular' },
      { id:'depuracion',label:'Depuración de toxinas' },
      { id:'serotonina',label:'Serotonina (ánimo)' },
      { id:'dopamina',label:'Dopamina (motivación)' },
      { id:'oxitocina',label:'Oxitocina (vínculo)' },
      { id:'melatonina',label:'Melatonina (sueño)' },
      { id:'cortisol',label:'Cortisol (estrés)' },
    ];
    const checklist=document.getElementById('checklist');
    if(checklist){
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
    }
    function setCheck(id,pct){
      pct=Math.max(0,Math.min(100,pct));
      const f=document.getElementById(`b-${id}`), p=document.getElementById(`p-${id}`);
      if(f) f.style.width=pct+'%'; if(p) p.textContent=Math.round(pct)+'%';
    }
    // defaults si esperan
    setTimeout(()=>{ if(document.getElementById('overlay')?.style.display!=='none'){
      setCheck('scan',10); setCheck('torrente',20); setCheck('operativos',25); setCheck('autorreparacion',8); setCheck('depuracion',12);
    }},1500);
    // al iniciar
    const sb=document.getElementById('startBtn');
    if(sb){ sb.addEventListener('click', ()=>{
      setCheck('scan',28); setCheck('torrente',84); setCheck('operativos',92);
      setCheck('autorreparacion',31); setCheck('depuracion',47);
      setCheck('serotonina',76); setCheck('dopamina',64); setCheck('oxitocina',58); setCheck('melatonina',71); setCheck('cortisol',43);
    }); }

  } // boot()
})();
