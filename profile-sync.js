/* profile-sync.js
   Sincroniza el HUD principal con los datos guardados por ciclos.html en localStorage.
   - Lee localStorage["cycles_app_state"] → { name, birthDate, birthTime, tz? }
   - Si existen, reemplaza el "Paciente" y calcula la edad en tiempo real.
   - Si no existen, no toca nada (deja el comportamiento actual del HUD).
*/

(function(){
  'use strict';

  function safeParse(json){
    try { return JSON.parse(json); } catch(e){ return null; }
  }

  function readCyclesProfile(){
    const raw = localStorage.getItem("cycles_app_state");
    if(!raw) return null;
    const st = safeParse(raw);
    if(!st || !st.name || !st.birthDate) return null;
    return st;
  }

  // Construye un Date local (del dispositivo) a partir de birthDate (YYYY-MM-DD) + birthTime (HH:MM)
  function buildLocalBirthDate(birthDate, birthTime){
    const [Y,M,D] = String(birthDate).split("-").map(Number);
    let h = 0, m = 0;
    if(birthTime){
      const hhmm = String(birthTime).split(":").map(Number);
      h = hhmm[0] || 0;
      m = hhmm[1] || 0;
    }
    return new Date(Y, (M-1), D, h, m, 0);
  }

  // Edad detallada tipo "40a 1m 12d 3h 22m 10s"
  function ageTextDetailed(birth, now){
    now = now || new Date();
    let y = now.getFullYear() - birth.getFullYear();
    let m = now.getMonth() - birth.getMonth();
    let d = now.getDate() - birth.getDate();
    let H = now.getHours() - birth.getHours();
    let Mi = now.getMinutes() - birth.getMinutes();
    let S = now.getSeconds() - birth.getSeconds();

    if (S < 0) { S += 60; Mi--; }
    if (Mi < 0) { Mi += 60; H--; }
    if (H < 0) { H += 24; d--; }

    if (d < 0) {
      // días del mes anterior
      const prevDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      d += prevDays; m--;
    }
    if (m < 0) { m += 12; y--; }

    return `${y}a ${m}m ${d}d ${H}h ${Mi}m ${S}s`;
  }

  function byId(id){ return document.getElementById(id); }

  // Renderiza nombre y edad en #project-meta y #age
  function renderProfile(name, birthDate, birthTime){
    const birth = buildLocalBirthDate(birthDate, birthTime);
    const metaEl = byId('project-meta');
    const ageEl  = byId('age');

    function tick(){
      const txt = ageTextDetailed(birth, new Date());
      if (metaEl){
        // Si el meta ya tiene HTML con "Paciente:", lo respetamos y solo reemplazamos el contenido
        metaEl.innerHTML = `Paciente: <b>${name}</b> · Edad: ${txt}`;
      }
      if (ageEl){
        ageEl.textContent = txt;
      }
    }

    tick();
    // Actualiza cada segundo
    setInterval(tick, 1000);
  }

  // Arranque tras DOM listo (importante si main.js también escribe)
  function onReady(fn){
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  onReady(function(){
    const prof = readCyclesProfile();
    if(!prof) return; // No hay perfil guardado → no tocamos nada

    // Datos mínimos
    const name = prof.name;
    const birthDate = prof.birthDate;       // "YYYY-MM-DD"
    const birthTime = prof.birthTime || ""; // "HH:MM" opcional

    renderProfile(name, birthDate, birthTime);
  });

})();
