/* =========================================================
   Gauges agrandados (estructura actual: dial/needle/hub/value)
   + botón ▶ Iniciar, + barra de progreso de órganos
   ========================================================= */

/* Módulos (podés editar títulos y órganos) */
const MODULES = [
  { id:'org-internos', title:'Rejuvenecimiento — Órganos internos', target:95,
    organs:['Hígado','Corazón','Pulmones','Riñones','Páncreas','Bazo','Estómago','Intestino','Tiroides'] },
  { id:'org-externos', title:'Rejuvenecimiento — Piel & tejido externo', target:92,
    organs:['Dermis','Epidermis','Folículos','Uñas','Cabello'] },
  { id:'glucosa', title:'Regulación de azúcar', target:94,
    organs:['Islotes pancreáticos','Sensibilidad insulina','Captación muscular'] },
  { id:'globulos', title:'Glóbulos (inmunidad)', target:90,
    organs:['Linfocitos','Neutrófilos','Monocitos','NK','Complemento'] },
  { id:'presion', title:'Presión arterial', target:88,
    organs:['Vascular','Endotelio','Ritmo','Barorreceptores'] },
  { id:'detox', title:'Detox hepático', target:93,
    organs:['Fase I','Fase II','Glutatión','Microsomas'] },
];

/* Helpers */
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function toAngle(v){ return -120 + (clamp(v,0,100)*2.4); } // -120..+120 deg

/* Construye tarjeta */
function createCard(mod){
  const card = document.createElement('section');
  card.className = 'card';

  card.innerHTML = `
    <div class="title-sm">${mod.title.toUpperCase()}</div>
    <div class="status"><i class="dot bad"></i><span>En espera</span></div>

    <div class="gauge">
      <div class="dial"></div>
      <div class="needle"></div>
      <div class="hub"></div>
      <div class="value">0%</div>
    </div>

    <div class="progress">
      <div class="prog-bar"><div class="prog-fill"></div></div>
      <div class="orgs"></div>
    </div>

    <div class="controls">
      <button class="btn mod">▶ Iniciar</button>
      <button class="btn alt mod">Detener</button>
    </div>
  `;

  // refs
  const dot   = card.querySelector('.dot');
  const stxt  = card.querySelector('.status span');
  const needle= card.querySelector('.needle');
  const value = card.querySelector('.value');
  const fill  = card.querySelector('.prog-fill');
  const orgs  = card.querySelector('.orgs');
  const bStart= card.querySelector('.btn.mod');
  const bStop = card.querySelector('.btn.alt.mod');

  // estado
  card._timer = null;
  card._active= false;
  card.dataset.current = 0;
  const goal = clamp(mod.target ?? 92, 70, 100);
  card._orgQueue = [...(mod.organs ?? [])];
  renderOrgList(orgs, card._orgQueue);

  // funciones ui
  function setStatus(text, level){
    dot.className = 'dot ' + level;
    stxt.textContent = text;
  }
  function setVisual(v, active){
    card.dataset.current = v;
    needle.style.transform = `rotate(${toAngle(v)}deg)`;
    value.textContent = `${Math.round(v)}%`;

    // estado por rangos
    if(v<40) setStatus(active?'Calibrando':'En espera', 'bad');
    else if(v<75) setStatus(active?'Ajustando':'En espera', 'warn');
    else setStatus('Estable', 'good');
  }
  function renderOrgList(el, list){
    if (!el) return;
    if (!list || !list.length){
      el.textContent = 'Órganos optimizados ✔';
      el.style.color = 'var(--ok)';
      return;
    }
    el.textContent = 'Optimizando: ' + list.join(' · ');
    el.style.color = '#ccf6ff';
  }

  function animateTo(goalV){
    clearInterval(card._timer);
    card._timer = setInterval(()=>{
      let cur = Number(card.dataset.current || 0);
      cur += (goalV - cur)*0.10 + 0.6;
      if (Math.abs(goalV - cur) < 0.6){
        cur = goalV;
        setVisual(cur,true);
        clearInterval(card._timer);
        card._active = false;
      } else {
        setVisual(cur,true);
      }

      // barra progreso
      fill.style.width = Math.round(cur) + '%';

      // consumir órganos a medida que sube
      if (card._orgQueue.length && Math.round(cur) % Math.max(1, Math.floor(100/Math.max(1, (mod.organs||[]).length))) === 0){
        card._orgQueue.shift();
        renderOrgList(orgs, card._orgQueue);
      }
    }, 100);
  }

  function start(){
    if (card._active) return;
    card._active = true;
    animateTo(goal);
  }
  function stop(){
    clearInterval(card._timer);
    card._active = false;
    // descenso suave a 10%
    card._timer = setInterval(()=>{
      let cur = Number(card.dataset.current || 10);
      cur -= Math.max(0.8, (cur - 10)*0.06);
      if (cur <= 10){
        cur = 10;
        setVisual(cur,false);
        fill.style.width = '10%';
        clearInterval(card._timer);
      } else {
        setVisual(cur,false);
        fill.style.width = Math.round(cur) + '%';
      }
    }, 90);
  }

  bStart.addEventListener('click', start);
  bStop.addEventListener('click', stop);

  // inicial
  setVisual(0, false);

  return card;
}

/* Monta la grilla */
const grid = document.getElementById('grid');
MODULES.forEach(m => grid.appendChild(createCard(m)));
