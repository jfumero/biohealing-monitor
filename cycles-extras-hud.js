/* cycles-extras-hud.js
   Unifica cálculos del HUD usando el perfil de ciclos.html
   (IDs adaptados a tu index: hd-zodiac, hd-czodiac, hd-moon, hd-circ, hd-bio-f/e/i).
*/
(function(){
  'use strict';

  // ---------- Utils ----------
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

  // ---------- Western Zodiac (tropical, aprox por fecha) ----------
  function dayOfYear(d){
    const start = new Date(d.getFullYear(),0,1);
    return Math.floor((d - start)/86400000) + 1;
  }
  function zodiacFromBirth(birth){
    const y = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate());
    const doy = dayOfYear(y);
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
    const animalIdx = (year - 1900) % 12;
    const a = ANIMALS[(animalIdx+12)%12];
    const stem = (year - 1924) % 10;
    const elem = ELEMENTS[Math.floor(((stem+10)%10)/2)];
    const emoji = ANIMAL_EMOJI[a] || "";
    return `${a} (${elem}) ${emoji}`;
  }

  // ---------- Moon phase (aprox) ----------
  function moonPhase(now){
    const known = Date.UTC(2000,0,6,18,14,0);
    const synodic = 29.530588853;
    const days = (now.getTime() - known)/86400000;
    const phase = (days % synodic + synodic) % synodic;
    const pct = phase/synodic;
    if (pct < 0.02 || pct > 0.98) return "Luna nueva 🌑";
    if (pct < 0.25) return "Creciente 🌒";
    if (pct < 0.27) return "Cuarto creciente 🌓";
    if (pct < 0.48) return "Gibosa creciente 🌔";
    if (pct < 0.52) return "Luna llena 🌕";
    if (pct < 0.73) return "Gibosa menguante 🌖";
    if (pct < 0.77) return "Cuarto menguante 🌗";
    return "Menguante 🌘";
  }

  // ---------- Circadian stage ----------
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
  function daysSince(d){ return Math.floor((Date.now() - d.getTime())/86400000); }
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
    if(!prof) return; // no interfiere si no hay perfil
    const birth = buildLocalBirthDate(prof.birthDate, prof.birthTime || "");

    const z = zodiacFromBirth(birth);
    const cz = chineseZodiac(birth.getFullYear());
    const moon = moonPhase(new Date());
    const circ = circadianStage(new Date());
    const bio = biorhythms(birth);

    const zEl = $("hd-zodiac"); if(zEl) zEl.textContent = z;
    const cEl = $("hd-czodiac"); if(cEl) cEl.textContent = cz;
    const mEl = $("hd-moon"); if(mEl) mEl.textContent = moon;
    const ciEl = $("hd-circ"); if(ciEl) ciEl.textContent = circ;

    const pf = $("hd-bio-f"); if(pf) pf.textContent = (bio.physical>=0?"+":"")+bio.physical+"% 💪";
    const pe = $("hd-bio-e"); if(pe) pe.textContent = (bio.emotional>=0?"+":"")+bio.emotional+"% 💖";
    const pi = $("hd-bio-i"); if(pi) pi.textContent = (bio.intellectual>=0?"+":"")+bio.intellectual+"% 🧠";
  }

  function ensureRefreshButton(){
    if (document.getElementById("cycles-refresh-btn")) return;
    const btn = document.createElement("button");
    btn.id = "cycles-refresh-btn";
    btn.textContent = "Refrescar datos";
    btn.className = "btn"; // si existe tu clase .btn, se verá coherente
    btn.style.position = "fixed";
    btn.style.top = "12px";
    btn.style.right = "12px";
    btn.style.zIndex = "9999";
    btn.style.opacity = "0.9";
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
    setInterval(renderAll, 30000);
  });

})();
