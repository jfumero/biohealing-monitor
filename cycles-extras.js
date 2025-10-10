/* cycles-extras.js
   Unifica cálculos del HUD con el perfil guardado por ciclos.html.
   - Lee localStorage["cycles_app_state"] → { name, birthDate, birthTime, tz? }
   - Recalcula y actualiza: Zodiaco (solar), Chino (animal+elemento), Fase lunar (actual),
     Etapa circadiana (actual), Biorritmos (F/E/I).
   - Añade un botón flotante "Refrescar datos" para re-leer y re-renderizar al instante.
   - Actúa solo si encuentra elementos con los IDs esperados. Si no existen, no hace nada.
*/

(function(){
  'use strict';

  // ---------- Utils ----------
  const DEG = Math.PI/180;

  function $(id){ return document.getElementById(id); }
  function safeParse(s){ try { return JSON.parse(s); } catch(e){ return null; } }
  function readProfile(){
    const raw = localStorage.getItem("cycles_app_state");
    if(!raw) return null;
    const st = safeParse(raw);
    if(!st || !st.birthDate) return null;
    return st;
  }
  function buildLocalBirthDate(birthDate, birthTime){
    const [Y,M,D] = String(birthDate).split("-").map(Number);
    let h=0,m=0;
    if(birthTime){
      const hhmm = String(birthTime).split(":").map(Number);
      h = hhmm[0]||0; m = hhmm[1]||0;
    }
    return new Date(Y,(M-1),D,h,m,0);
  }

  // ---------- Western Zodiac (tropical, por fecha de nacimiento) ----------
  const ZSIGNS = [
    ["Capricornio","♑", 120], // Jan 1 (Cap: Dec 22–Jan 19)
    ["Acuario","♒", 131],
    ["Piscis","♓", 160],
    ["Aries","♈",  90], // Mar 21
    ["Tauro","♉",  120],// Apr 20
    ["Géminis","♊",151],// May 21
    ["Cáncer","♋", 172],// Jun 21
    ["Leo","♌",    204],// Jul 23
    ["Virgo","♍",  235],// Aug 23
    ["Libra","♎",  266],// Sep 23
    ["Escorpio","♏",296],// Oct 23
    ["Sagitario","♐",326],// Nov 22
    ["Capricornio","♑", 356] // Dec 22
  ];
  function dayOfYear(d){
    const start = new Date(d.getFullYear(),0,1);
    const diff = d - start;
    return Math.floor(diff/86400000) + 1;
  }
  function zodiacFromBirth(birth){
    // Tabla por rangos aproximados (tropical, sin considerar año bisiesto al cruzar)
    const y = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate());
    const doy = dayOfYear(y);
    // Rangos (aprox): Aries 80-110, Tauro 111-141, Géminis 142-172, Cáncer 173-204,
    // Leo 205-235, Virgo 236-266, Libra 267-296, Escorpio 297-325, Sagitario 326-355, Capricornio 356-19, Acuario 20-49, Piscis 50-79
    let sign="Capricornio", sym="♑";
    if((doy>=20)&&(doy<=49))  { sign="Acuario"; sym="♒"; }
    else if((doy>=50)&&(doy<=79)) { sign="Piscis"; sym="♓"; }
    else if((doy>=80)&&(doy<=110)) { sign="Aries"; sym="♈"; }
    else if((doy>=111)&&(doy<=141)) { sign="Tauro"; sym="♉"; }
    else if((doy>=142)&&(doy<=172)) { sign="Géminis"; sym="♊"; }
    else if((doy>=173)&&(doy<=204)) { sign="Cáncer"; sym="♋"; }
    else if((doy>=205)&&(doy<=235)) { sign="Leo"; sym="♌"; }
    else if((doy>=236)&&(doy<=266)) { sign="Virgo"; sym="♍"; }
    else if((doy>=267)&&(doy<=296)) { sign="Libra"; sym="♎"; }
    else if((doy>=297)&&(doy<=325)) { sign="Escorpio"; sym="♏"; }
    else if((doy>=326)&&(doy<=355)) { sign="Sagitario"; sym="♐"; }
    else { sign="Capricornio"; sym="♑"; }
    return `${sign} ${sym}`;
  }

  // ---------- Chinese Zodiac ----------
  const ANIMALS = ["Rata","Buey","Tigre","Conejo","Dragón","Serpiente","Caballo","Cabra","Mono","Gallo","Perro","Cerdo"];
  const ANIMAL_EMOJI = { "Rata":"🐀","Buey":"🐂","Tigre":"🐅","Conejo":"🐇","Dragón":"🐉","Serpiente":"🐍","Caballo":"🐎","Cabra":"🐐","Mono":"🐒","Gallo":"🐓","Perro":"🐕","Cerdo":"🐖" };
  const ELEMENTS = ["Madera","Fuego","Tierra","Metal","Agua"];
  function chineseZodiac(year){
    // ciclo animal base 1900: Rata
    const animalIdx = (year - 1900) % 12; // puede ser negativo en teoría
    const a = ANIMALS[(animalIdx+12)%12];
    // Elemento: cada 2 años cambia; tomamos base 1924=Rata Madera Yang → índice 0
    const stem = (year - 1924) % 10; // 0..9
    const elem = ELEMENTS[Math.floor(((stem+10)%10)/2)]; // 0,1→Madera;2,3→Fuego;4,5→Tierra;6,7→Metal;8,9→Agua
    const emoji = ANIMAL_EMOJI[a] || "";
    return `${a} (${elem}) ${emoji}`;
  }

  // ---------- Moon phase (aprox) ----------
  function moonPhase(now){
    // Algoritmo simple: días transcurridos desde una luna nueva conocida
    // Referencia: 2000-01-06 18:14 UTC (aprox). Sin TZ para simple.
    const known = Date.UTC(2000,0,6,18,14,0);
    const synodic = 29.530588853; // días
    const days = (now.getTime() - known)/86400000;
    const phase = (days % synodic + synodic) % synodic; // 0..29.53
    const pct = phase/synodic;
    // Fases textuales
    if (pct < 0.02 || pct > 0.98) return "Luna nueva 🌑";
    if (pct < 0.25) return "Creciente 🌒";
    if (pct < 0.27) return "Cuarto creciente 🌓";
    if (pct < 0.48) return "Gibosa creciente 🌔";
    if (pct < 0.52) return "Luna llena 🌕";
    if (pct < 0.73) return "Gibosa menguante 🌖";
    if (pct < 0.77) return "Cuarto menguante 🌗";
    return "Menguante 🌘";
  }

  // ---------- Circadian stage (heurística por hora local) ----------
  function circadianStage(now){
    const h = now.getHours();
    if (h < 5)  return "Sueño profundo";
    if (h < 8)  return "Amanecer / Activación";
    if (h < 12) return "Empuje matutino";
    if (h < 15) return "Pico medio día";
    if (h < 18) return "Desaceleración vespertina";
    if (h < 22) return "Vigilia relajada nocturna";
    return "Transición al sueño";
  }

  // ---------- Biorhythms ----------
  function daysSince(d){
    const ms = Date.now() - d.getTime();
    return Math.floor(ms/86400000);
    // si quisieras precisión a fracciones de día, usar ms/86400000 sin floor
  }
  function biorhythms(birth){
    const t = daysSince(birth);
    const phys = Math.sin(2*Math.PI*t/23);
    const emo  = Math.sin(2*Math.PI*t/28);
    const intel= Math.sin(2*Math.PI*t/33);
    return {
      physical: Math.round(phys*100),
      emotional: Math.round(emo*100),
      intellectual: Math.round(intel*100)
    };
  }

  // ---------- Render ----------
  function renderAll(){
    const prof = readProfile();
    if(!prof) return; // no interfiere con HUD si no hay perfil guardado
    const birth = buildLocalBirthDate(prof.birthDate, prof.birthTime || "");

    // Zodiaco (por nacimiento)
    const z = zodiacFromBirth(birth);
    const zEl = $("zodiac-sign"); if(zEl) zEl.textContent = z;

    // Chino (por año nacimiento)
    const cz = chineseZodiac(birth.getFullYear());
    const cEl = $("chinese-sign"); if(cEl) cEl.textContent = cz;

    // Luna (actual)
    const moon = moonPhase(new Date());
    const mEl = $("moon-phase"); if(mEl) mEl.textContent = moon;

    // Circadiano (actual)
    const cir = circadianStage(new Date());
    const ciEl = $("circadian-stage"); if(ciEl) ciEl.textContent = cir;

    // Biorritmos (según nacimiento)
    const bio = biorhythms(birth);
    const pEl = $("biorhythm-physical");
    const eEl = $("biorhythm-emotional");
    const iEl = $("biorhythm-intellectual");
    if(pEl) pEl.textContent = (bio.physical>=0?"+":"") + bio.physical + "% 💪";
    if(eEl) eEl.textContent = (bio.emotional>=0?"+":"") + bio.emotional + "% 💖";
    if(iEl) iEl.textContent = (bio.intellectual>=0?"+":"") + bio.intellectual + "% 🧠";
  }

  // ---------- Botón Refrescar ----------
  function ensureRefreshButton(){
    if ($("cycles-refresh-btn")) return;
    const btn = document.createElement("button");
    btn.id = "cycles-refresh-btn";
    btn.textContent = "Refrescar datos";
    btn.style.position = "fixed";
    btn.style.top = "10px";
    btn.style.right = "10px";
    btn.style.zIndex = "9999";
    btn.style.padding = "6px 10px";
    btn.style.borderRadius = "10px";
    btn.style.border = "1px solid rgba(255,255,255,.25)";
    btn.style.background = "rgba(0,0,0,.35)";
    btn.style.color = "#fff";
    btn.style.backdropFilter = "blur(4px)";
    btn.style.cursor = "pointer";
    btn.addEventListener("click", renderAll);
    document.body.appendChild(btn);
  }

  function onReady(fn){
    if(document.readyState === "loading"){
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    }else{
      fn();
    }
  }

  onReady(function(){
    ensureRefreshButton();
    renderAll();
    // Actualiza valores que dependen del tiempo (luna/circadiano/biorritmos) cada 30s
    setInterval(renderAll, 30000);
  });

})();
