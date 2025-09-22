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
      return years+' años';
    }

    // ---------- Estado global ----------
    const state = {
      powered:false,
      sound:true,
      retro:false,
      nano: { target:120000, value:0 },
      integration: { target:93, value:0 },
      modules:[
        { id:'scan', name:'Escaneo general', unit:'%', value:0, status:'En espera' },
        { id:'torrente', name:'Torrente sanguíneo', unit:'%', value:0, status:'En espera' },
        { id:'operativos', name:'Nanorobots operativos', unit:'%', value:0, status:'En espera' },
        { id:'autorreparacion', name:'Autorreparación', unit:'%', value:0, status:'En espera' },
        { id:'depuracion', name:'Depuración', unit:'%', value:0, status:'En espera' },
        { id:'serotonina', name:'Serotonina', unit:'%', value:0, status:'En espera' },
        { id:'dopamina', name:'Dopamina', unit:'%', value:0, status:'En espera' },
        { id:'oxitocina', name:'Oxitocina', unit:'%', value:0, status:'En espera' },
        { id:'melatonina', name:'Melatonina', unit:'%', value:0, status:'En espera' },
        { id:'cortisol', name:'Cortisol', unit:'%', value:0, status:'En espera' },
      ]
    };

    // ---------- Elementos ----------
    const overlay = el('overlay');
    const nanoCount = el('nanoCount');
    const nanoBar = el('nanoBar');
    const intRate = el('intRate');
    const intBar = el('intBar');
    const startBtn = el('startBtn');
    const grid = el('grid');
    const checklist = el('checklist');
    const agepill = el('agepill');

    const led = el('status-led');
    const powerBtn = el('power-btn');
    const soundBtn = el('sound-btn');
    const ambBtn = el('amb-btn');

    agepill.textContent = ageTextCompact();

    // ---------- Construcción de tarjetas ----------
    const defs = [
      { id:'scan', label:'Escaneo general', min:0, max:100 },
      { id:'torrente', label:'Torrente sanguíneo', min:0, max:100 },
      { id:'operativos', label:'Nanorobots operativos', min:0, max:100 },
      { id:'autorreparacion', label:'Autorreparación', min:0, max:100 },
      { id:'depuracion', label:'Depuración', min:0, max:100 },
      { id:'serotonina', label:'Serotonina', min:0, max:100 },
      { id:'dopamina', label:'Dopamina', min:0, max:100 },
      { id:'oxitocina', label:'Oxitocina', min:0, max:100 },
      { id:'melatonina', label:'Melatonina', min:0, max:100 },
      { id:'cortisol', label:'Cortisol', min:0, max:100 },
    ];

    defs.forEach(d => grid.appendChild(buildCard(d)));

    // ---------- Checklist ----------
    const checks = [
      { id:'scan', label:'Escaneo del sistema' },
      { id:'torrente', label:'Lectura de torrente sanguíneo' },
      { id:'operativos', label:'Nanorobots operativos' },
      { id:'autorreparacion', label:'Autorreparación en curso' },
      { id:'depuracion', label:'Depuración' },
      { id:'serotonina', label:'Serotonina' },
      { id:'dopamina', label:'Dopamina' },
      { id:'oxitocina', label:'Oxitocina' },
      { id:'melatonina', label:'Melatonina' },
      { id:'cortisol', label:'Cortisol' },
    ];
    checks.forEach(c => {
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `
        <div class="row-head">
          <div class="row-label">${c.label}</div>
          <div class="perc" id="p-${c.id}">0%</div>
        </div>
        <div class="bar"><div class="fill" id="f-${c.id}"></div></div>
      `;
      checklist.appendChild(row);
    });

    // ---------- Overlay / inicio ----------
    let nanoTimer, intTimer;

    function openOverlay(){
      overlay.style.display = '';
      animateOverlay();
    }
    function closeOverlay(){
      overlay.style.display = 'none';
      clearInterval(nanoTimer); clearInterval(intTimer);
      // encender
      setPower(true);
    }
    function animateOverlay(){
      let n=0, i=0;
      const nTarget = state.nano.target;
      const iTarget = state.integration.target;
      nanoTimer = setInterval(()=>{
        n = Math.min(n+Math.floor(Math.random()*2400)+600, nTarget);
        nanoCount.textContent = n.toLocaleString('es-UY');
        nanoBar.style.width = (n/nTarget*100)+'%';
        if(n>=nTarget) clearInterval(nanoTimer);
      }, 120);
      intTimer = setInterval(()=>{
        i = Math.min(i+Math.floor(Math.random()*6)+1, iTarget);
        intRate.textContent = i;
        intBar.style.width = i+'%';
        if(i>=iTarget) clearInterval(intTimer);
      }, 200);
    }

    startBtn?.addEventListener('click', closeOverlay);
    // Failsafe por si no clickean
    setTimeout(()=>{ if(overlay.style.display!=='none'){ closeOverlay(); } }, 15000);

    openOverlay();

    // ---------- Botonera header ----------
    powerBtn.addEventListener('click', ()=>{
      setPower(!state.powered);
    });
    soundBtn.addEventListener('click', ()=>{
      state.sound = !state.sound;
      soundBtn.textContent = `Sonido: ${state.sound?'ON':'OFF'}`;
      soundBtn.setAttribute('aria-pressed', String(!state.sound));
      beep(220, 70);
    });
    ambBtn.addEventListener('click', ()=>{
      state.retro = !state.retro;
      ambBtn.textContent = `Ambiente: ${state.retro?'ON':'OFF'}`;
      ambBtn.setAttribute('aria-pressed', String(state.retro));
      document.body.classList.toggle('retro', state.retro);
      beep(880, 50);
    });

    function setPower(on){
      state.powered = on;
      powerBtn.textContent = on ? 'Apagar' : 'Encender';
      powerBtn.setAttribute('aria-pressed', String(on));
      led.classList.toggle('on', on);

      document.querySelectorAll('.card .controls button')
        .forEach(b => { b.disabled = !on; });

      if(on){ beep(660, 80); } else { beep(120, 120); }
    }

    // ---------- Construir una tarjeta con gauge ----------
    function buildCard(def){
      const card = document.createElement('section');
      card.className = 'card';
      card.innerHTML = `
        <div class="title-sm">${def.label}</div>
        <div class="status"><span class="dot"></span><span class="txt" id="s-${def.id}">En espera</span></div>
        <div class="gauge" id="g-${def.id}">
          <div class="dial"></div>
          <div class="ring"></div>
          ${buildTicksAndLabels(210, -60, 10, def.min, def.max)}
          <div class="needle shadow"></div>
          <div class="needle" id="n-${def.id}"></div>
          <div class="glow" id="gl-${def.id}"></div>
          <div class="hub"></div>
          <div class="value" id="v-${def.id}">0${def.unit||'%'}</div>
        </div>
        <div class="controls">
          <button class="btn start" data-id="${def.id}" disabled>Activar</button>
          <button class="btn alt stop" data-id="${def.id}" disabled>Detener</button>
        </div>
      `;
      const start = card.querySelector('.start');
      const stop = card.querySelector('.stop');
      start.addEventListener('click', ()=> startModule(def.id));
      stop.addEventListener('click', ()=> stopModule(def.id));
      return card;
    }

    function buildTicksAndLabels(startDeg, endDeg, step, min, max){
      const total = Math.abs(endDeg - startDeg);
      const ticks = [];
      const labels = [];
      let idx = 0;
      for(let ang = startDeg; ang>=endDeg; ang -= step){
        const major = (idx % 3) === 0;
        ticks.push(`<div class="tick ${major?'major':''}" style="transform: translate(-50%,-50%) rotate(${ang}deg)"></div>`);
        if(major){
          const t = idx/3;
          const val = Math.round(min + (max-min)*(t/((total/step)/3)));
          const r = 88;
          const rad = (ang-90)*Math.PI/180;
          const x = 50 + r*Math.cos(rad);
          const y = 50 + r*Math.sin(rad);
          labels.push(`<div class="label" style="left:${x}%; top:${y}%">${val}</div>`);
        }
        idx++;
      }
      return ticks.join('') + labels.join('');
    }

    // ---------- Lógica de módulos ----------
    const timers = new Map();

    function startModule(id){
      setStatus(id, 'Calibrando', 'warn');
      const target = 60 + Math.floor(Math.random()*40); // 60-99
      animateNeedle(id, target, true);
      progress(id, 0);
      const t = setInterval(()=>{
        const v = Math.min(getVal(id)+Math.random()*8, target);
        setVal(id, v);
        progress(id, v);
        if(v>=target-0.5){
          clearInterval(t);
          setStatus(id, 'Estable', 'good');
          if(state.sound) beep(520, 60);
        }
      }, 220);
      timers.set(id, t);
    }

    function stopModule(id){
      setStatus(id, 'En espera', '');
      animateNeedle(id, 0, false);
      progress(id, 0);
      const t = timers.get(id);
      if(t){ clearInterval(t); timers.delete(id); }
      if(state.sound) beep(160, 50);
    }

    function getVal(id){
      const v = el(`v-${id}`).textContent.replace('%','');
      return parseFloat(v)||0;
    }
    function setVal(id, v){
      el(`v-${id}`).textContent = Math.round(v)+'%';
    }
    function setStatus(id, text, kind){
      const st = el(`s-${id}`);
      const dot = st?.parentElement?.querySelector('.dot');
      st.textContent = text;
      dot?.classList.remove('good','warn');
      if(kind) dot?.classList.add(kind);
    }

    function animateNeedle(id, target, glow){
      const needle = el(`n-${id}`);
      const glowEl = el(`gl-${id}`);
      const deg = 210 - (target*2.7); // 0% -> 210deg, 100% -> -60deg
      needle.style.transform = `rotate(${deg}deg)`;
      if(glow) glowEl.style.transform = 'scale(1.02)'; else glowEl.style.transform = 'scale(1)';
    }

    // ---------- Sonidos ----------
    let audioCtx;
    function beep(freq=440, dur=120){
      if(!state.sound) return;
      try{
        if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        o.connect(g); g.connect(audioCtx.destination);
        g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur/1000);
        o.start(); o.stop(audioCtx.currentTime + dur/1000 + 0.02);
      }catch(e){}
    }

    // ---------- Utilidades ----------
    function el(id){ return document.getElementById(id); }

    // ---------- Progreso checklist helpers ----------
    function progress(id, pct){
      const f = document.getElementById(`f-${id}`);
      const p = document.getElementById(`p-${id}`);
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

    function setCheck(id, pct){
      const f = document.getElementById(`f-${id}`);
      const p = document.getElementById(`p-${id}`);
      if(f) f.style.width=pct+'%'; if(p) p.textContent=Math.round(pct)+'%';
    }

  } // boot()
})();
