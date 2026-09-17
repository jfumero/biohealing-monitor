import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Astro from 'astronomy-engine';
import { Shell } from './Shell';
import { readProfile, writeProfile, validDate, biorhythm, zodiac, dayDistance, localDate } from './profile';
import './theme.css';

    const { useEffect, useMemo, useState } = React;
    // Astronomy global (según build)
    

import { PI, deg2rad, rad2deg, norm360, pad2, todayDateStr, dayOfYear, bioVal, vowels, pythMap, stripAccents, letterVal, reduceNum, reduceNoMasters, lifePath, sumName, expressionNum, soulUrgeNum, personalityNum, maturityNum, personalYear, personalMonth, personalDay, westernSun, chineseAnimal, chineseElement, gregorianToJDN, tzNames, tzTones, tzolkinForDate, RUNES, natalRune, yearlyRune, CHALDEAN, dayLordFromWeekday, seqFromLord, sunriseSunset, nextDay, planetaryHours, J2000_UTC, centuriesSinceJ2000, ayanamsaLahiri, eclipticLongitude, siderealLongitude, NAK_NAMES, DASHA_LORDS, DASHA_YEARS, nakshatraFromLon, currentMahadasha, findDesignDate, gateFromDegreesUniform } from './cycle-calculations';
    // === UI ===
    const HELP = {
      configuracion: {
        title: "Configuración",
        body: [
          ["Nombre completo", "Se usa para numerología (Expresión/Destino, Alma, Personalidad)."],
          ["Fecha de nacimiento", "Base para biorritmos, numerología, signos, runas, etc."],
          ["Hora de nacimiento", "En esta versión casi no cambia nada; útil si luego agregás ascendente/casas."],
          ["Latitud/Longitud/Huso", "Se usa para amanecer/atardecer → horas planetarias."],
          ["Fecha a calcular", "El día objetivo para todos los cálculos diarios."]
        ]
      },
      resumen: {
        title: "Resumen rápido",
        body: [
          ["Occidental (Sol)", "Signo solar occidental por fecha."],
          ["Chino", "Animal y elemento del año de nacimiento."],
          ["Maya", "Tono y sello del Tzolk’in para la fecha objetivo."],
          ["Runas", "Arquetipos activos natal y del año."]
        ]
      },
      biorritmos: {
        title: "Biorritmos",
        body: [
          ["Físico (23)", "Vitalidad y energía corporal."],
          ["Emocional (28)", "Sensibilidad y variación anímica."],
          ["Intelectual (33)", "Enfoque mental y aprendizaje."],
          ["Lectura", "Indicador de energía corporal, emocional e intelectual del ciclo actual."]
        ]
      },
      numerologia: {
        title: "Numerología",
        body: [
          ["Camino de Vida", "Tema central de vida (fecha)."],
          ["Destino/Expresión", "Talentos y forma de expresarte (nombre completo)."],
          ["Urgencia del Alma", "Motivación interna (vocales)."],
          ["Personalidad", "Cómo te perciben (consonantes)."],
          ["Madurez", "Síntesis de vida + expresión."],
          ["Año/Mes/Día Personal", "Ciclos para planificar foco anual, mensual y diario."]
        ]
      },
      horas: {
        title: "Horas planetarias",
        body: [
          ["Qué es", "Divide día y noche en 12+12 horas desiguales y asigna planetas por orden tradicional."],
          ["Para qué sirve", "Elegir momentos operativos favorables (Mercurio: papeles, Venus: vínculos, etc.)."],
          ["Lectura", "Cálculo operativo por amanecer/atardecer + huso fijo."]
        ]
      },
      jyotish: {
        title: "Jyotish (védica)",
        body: [
          ["Ayanamsa", "Ajuste tropical→sideral Lahiri."],
          ["Sol/Luna sideral", "Posiciones siderales usadas en astrología védica."],
          ["Nakshatra/Pada", "Constelación lunar (27) y subdivisión (pada)."],
          ["Mahadasha", "Ciclo mayor Vimshottari basado en Luna natal."],
          ["Nota", "No incluye ascendente ni casas en esta versión."]
        ]
      },
      hd: {
        title: "Human Design (básico)",
        body: [
          ["Fecha de Diseño", "Se busca cuando el Sol está ~88° antes del nacimiento."],
          ["Gates", "Puertas calculadas por división uniforme del zodiaco."],
          ["Perfil", "Combinación de líneas (p.ej. 5/1)."],
          ["Nota", "Para exactitud, usar mandala oficial / librería específica."]
        ]
      },
      tabla30: {
        title: "Próximos 30 días",
        body: [
          ["Para qué sirve", "Agenda de tendencias: biorritmos + día personal + sello/tono maya."]
        ]
      }
    };


function Modal({ title, subtitle, onClose, children }) {
  const ref = React.useRef(null);
  const titleId = React.useId();
  React.useEffect(() => { const dialog=ref.current; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} aria-labelledby={titleId} onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="flex justify-between items-start gap-3 mb-2"><div><h4 id={titleId} className="text-lg font-semibold">{title}</h4><p className="text-xs text-gray-500">{subtitle}</p></div><button className="px-2 py-1 rounded-lg border text-sm" onClick={onClose} autoFocus>Cerrar</button></div>
    <div className="text-sm leading-6">{children}</div>
  </dialog>;
}

    const Card = ({ title, helpKey, interpTitle="Interpretación", interpContent=null, children }) => {
  const [openHelp, setOpenHelp] = React.useState(false);
  const [openInterp, setOpenInterp] = React.useState(false);
  const help = helpKey ? HELP[helpKey] : null;


  return (
    <div className="cycle-card rounded-2xl shadow p-4 bg-white/80 backdrop-blur border border-gray-100 relative">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>

        <div className="flex items-center gap-2">
          {help && (
            <button
              className="shrink-0 px-2 py-1 rounded-lg border text-xs hover:bg-gray-50"
              onClick={() => setOpenHelp(true)}
              title="¿Qué significa esto?"
            >
              Ayuda
            </button>
          )}

          {interpContent && (
            <button
              className="shrink-0 px-2 py-1 rounded-lg border text-xs hover:bg-gray-50"
              onClick={() => setOpenInterp(true)}
              title="Interpretación"
            >
              Interpretar
            </button>
          )}
        </div>
      </div>

      {children}

      {openHelp && help && (
        <Modal
          title={help.title}
          subtitle="Guía rápida de interpretación"
          onClose={() => setOpenHelp(false)}
        >
          <ul className="list-disc pl-5 space-y-1">
            {help.body.map(([k, v]) => (
              <li key={k}>
                <strong>{k}:</strong> {v}
              </li>
            ))}
          </ul>
        </Modal>
      )}

      {openInterp && interpContent && (
        <Modal
          title={interpTitle}
          subtitle="Lectura dinámica según tus valores actuales"
          onClose={() => setOpenInterp(false)}
        >
          {interpContent}
        </Modal>
      )}
    </div>
  );
};

    const Field = ({ label, children }) => (
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-gray-600">{label}</span>
        {children}
      </label>
    );
    const fmtHM = (d)=> `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

    // === Interpretaciones (dinámicas) ===
const levelLabel = (v) => {
  if (v >= 60) return "muy alto";
  if (v >= 25) return "alto";
  if (v > -25) return "medio";
  if (v > -60) return "bajo";
  return "muy bajo";
};
const levelAdvice = (v, high, mid, low) => {
  if (v >= 25) return high;
  if (v > -25) return mid;
  return low;
};

const NUM_DAY_MEANING = {
  1:{k:"Inicio", t:"Arrancar, decidir, dar el primer paso. Ideal para iniciar algo simple."},
  2:{k:"Vínculos", t:"Cooperar, escuchar, negociar. Mejor ir suave y en equipo."},
  3:{k:"Expresión", t:"Comunicar, socializar, creatividad. Buen día para mostrarte."},
  4:{k:"Orden", t:"Estructura, rutina, foco. Excelente para poner el piso y organizar."},
  5:{k:"Cambio", t:"Movimiento, flexibilidad, probar. Evitá rigidez; ajustá sobre la marcha."},
  6:{k:"Cuidado", t:"Familia, armonía, responsabilidad afectiva. Ideal para resolver con calidez."},
  7:{k:"Introspección", t:"Pausa, análisis, estudio, silencio. Mejor menos ruido y más profundidad."},
  8:{k:"Logro", t:"Resultados, finanzas, liderazgo. Buen día para cerrar y empujar objetivos."},
  9:{k:"Cierre", t:"Soltar, limpiar, terminar. Día para depurar y cerrar ciclos."},
  11:{k:"Inspiración", t:"Intuición alta, visión. Bajá a tierra con pasos chicos."},
  22:{k:"Construcción", t:"Materializar en grande con método. Prioriza estructura y paciencia."},
};

const PLANET_KEYS = {
  "Sol":"Visibilidad, liderazgo, vitalidad",
  "Luna":"Hogar, intuición, cuidado",
  "Mercurio":"Papeles, comunicación, estudio",
  "Venus":"Vínculos, belleza, armonía",
  "Marte":"Acción, decisión, corte",
  "Júpiter":"Expansión, oportunidades, confianza",
  "Saturno":"Orden, límites, disciplina",
};

const HD_LINE = {
  1:"Línea 1: base, investigación, seguridad en lo sólido.",
  2:"Línea 2: talento natural, necesidad de retiro y llamado correcto.",
  3:"Línea 3: aprendizaje por prueba/error, adaptación, resiliencia.",
  4:"Línea 4: redes, oportunidades por vínculos, influencia cercana.",
  5:"Línea 5: soluciones prácticas, proyección, liderazgo (cuidar expectativas).",
  6:"Línea 6: visión, madurez, ejemplo; aprende por etapas.",
};

export function App(){
      const [initial] = useState(readProfile);
      const [name,setName]=useState(initial.name);
      const [birthDate,setBirthDate]=useState(initial.birthDate);
      const [birthTime,setBirthTime]=useState(initial.birthTime);
      const [lat,setLat]=useState(initial.lat);
      const [lon,setLon]=useState(initial.lon);
      const [tz,setTz]=useState(initial.tz);
      const [dateStr,setDateStr]=useState(todayDateStr());
      const [saveError,setSaveError]=useState(false);
      const locationValid = lat !== '' && lon !== '' && tz !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lon)) && Number.isFinite(Number(tz)) && Number(lat)>=-90 && Number(lat)<=90 && Number(lon)>=-180 && Number(lon)<=180 && Number(tz)>=-12 && Number(tz)<=14;
      useEffect(()=>{
        if(locationValid) setSaveError(!writeProfile({name,birthDate,birthTime,lat,lon,tz}));
      },[name,birthDate,birthTime,lat,lon,tz,locationValid]);
      useEffect(()=>{
        const openProfile = () => {
          if(location.hash==='#perfil') {
            document.getElementById('perfil')?.setAttribute('open','');
            document.getElementById('perfil')?.scrollIntoView();
          }
        };
        openProfile(); window.addEventListener('hashchange',openProfile);
        return () => window.removeEventListener('hashchange',openProfile);
      },[]);

      const birth=useMemo(()=> new Date(`${birthDate}T${birthTime || "00:00"}:00`),[birthDate,birthTime]);
      const target=useMemo(()=> new Date(`${dateStr}T12:00:00`),[dateStr]);

      // Biorritmos
      const bio=useMemo(()=>({
        physical: Math.round(bioVal(birth,target,23)*1000)/10,
        emotional: Math.round(bioVal(birth,target,28)*1000)/10,
        intellectual: Math.round(bioVal(birth,target,33)*1000)/10,
      }),[birth,target]);

      // Numerología
      const num=useMemo(()=>{
        const lp=lifePath(birth), exp=expressionNum(name), soul=soulUrgeNum(name), pers=personalityNum(name);
        const mat=maturityNum(lp,exp), py=personalYear(birth,target.getFullYear());
        const pm=personalMonth(py,target.getMonth()+1), pd=personalDay(birth,target);
        return { lp,exp,soul,pers,mat,py,pm,pd };
      },[birth,name,target]);

      const maya=useMemo(()=> tzolkinForDate(target),[target]);
      const occidental=useMemo(()=> westernSun(birth),[birth]);
      const chino=useMemo(()=> ({animal:chineseAnimal(birth.getFullYear()), element:chineseElement(birth.getFullYear())}),[birth]);
      const runes=useMemo(()=> ({natal:natalRune(birth), year:yearlyRune(birth,target.getFullYear())}),[birth,target]);

      // Horas planetarias
      const planetHours=useMemo(()=> locationValid ? planetaryHours(target, Number(lat), Number(lon), Number(tz)) : {error:"Introduce una ubicación válida.",rows:[]},[target,lat,lon,tz,locationValid]);

      // Jyotish (corregido)
      const jyotish=useMemo(()=>{
        try{
          const ayan=ayanamsaLahiri(target);
          const lonSunTrop=eclipticLongitude(Astro.Body.Sun, target);
          const lonMoonTrop=eclipticLongitude(Astro.Body.Moon, target);
          const lonSunSid=siderealLongitude(lonSunTrop, ayan);
          const lonMoonSid=siderealLongitude(lonMoonTrop, ayan);
          const nk=nakshatraFromLon(lonMoonSid);

          const moonBirthSid=siderealLongitude(
            eclipticLongitude(Astro.Body.Moon, birth),
            ayanamsaLahiri(birth)
          );
          const md=currentMahadasha(birth, target, moonBirthSid);

          const sidSigns=["Aries","Tauro","Géminis","Cáncer","Leo","Virgo","Libra","Escorpio","Sagitario","Capricornio","Acuario","Piscis"];
          const sunSign=sidSigns[Math.floor(lonSunSid/30)];

          return { ayan, lonSunSid, lonMoonSid, sunSign, nakshatra:nk, mahadasha:md };
        }catch(e){ return { error:e?.message || String(e) }; }
      },[birth,target]);

      // Human Design (básico) – corregido
      const hd=useMemo(()=>{
        try{
          const designDate=findDesignDate(birth);
          const sunPers=eclipticLongitude(Astro.Body.Sun, birth);
          const sunDesi=eclipticLongitude(Astro.Body.Sun, designDate);
          const gP=gateFromDegreesUniform(sunPers);
          const gD=gateFromDegreesUniform(sunDesi);
          const profile=`${gP.line}/${gD.line}`;
          return { designDate, sunPers, sunDesi, gatePers:gP, gateDes:gD, profile, note:"Para gates exactos usa el mandala oficial (hdkit)." };
        }catch(e){ return { error:e?.message || String(e) }; }
      },[birth]);

      // Dashboard 30 días
      const dashboard=useMemo(()=>{
        const rows=[]; const baseDays=dayDistance(birth,target);
        for(let i=0;i<30;i++){
          const d=new Date(target); d.setDate(d.getDate()+i);
          const bf=Math.round(Math.sin((2*PI*(baseDays+i))/23)*1000)/10;
          const be=Math.round(Math.sin((2*PI*(baseDays+i))/28)*1000)/10;
          const bi=Math.round(Math.sin((2*PI*(baseDays+i))/33)*1000)/10;
          const pd=personalDay(birth,d);
          const {tone,seal}=tzolkinForDate(d);
          rows.push({ date:localDate(d), bf,be,bi, pd, tone, seal });
        }
        return rows;
      },[birth,target]);

      // UI
      const fmtHM=(d)=>`${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

// === Interpretación dinámica (según valores actuales) ===
const interpBio = (
  <div className="space-y-3">
    <p className="text-sm">
      Tus biorritmos hoy están en un nivel <strong>{levelLabel(bio.physical)}</strong> (físico),
      <strong> {levelLabel(bio.emotional)}</strong> (emocional) y <strong>{levelLabel(bio.intellectual)}</strong> (intelectual).
    </p>
    <ul className="list-disc pl-5 space-y-1 text-sm">
      <li><strong>Físico ({bio.physical}%):</strong> {levelAdvice(bio.physical,
        "Aprovechá para moverte, resolver pendientes y encarar tareas que requieren energía.",
        "Ritmo normal: hacé lo importante con pausas cortas.",
        "Bajá un cambio: priorizá descanso, hidratación y tareas livianas."
      )}</li>
      <li><strong>Emocional ({bio.emotional}%):</strong> {levelAdvice(bio.emotional,
        "Buen día para conversaciones sensibles, vínculos y creatividad.",
        "Emociones más estables: elegí claridad y no sobreinterpretes.",
        "Sensibilidad alta: evitá decisiones impulsivas y cuidá tu entorno."
      )}</li>
      <li><strong>Intelectual ({bio.intellectual}%):</strong> {levelAdvice(bio.intellectual,
        "Ideal para estudiar, escribir, planificar, hacer cuentas o resolver problemas.",
        "Mente pareja: hacé una lista corta y ejecutá paso a paso.",
        "Si cuesta enfocarte, trabajá en bloques cortos y reducí multitarea."
      )}</li>
    </ul>
    <p className="text-xs text-gray-500">Usalo como lectura operativa de tu energía disponible.</p>
  </div>
);

const dayKey = NUM_DAY_MEANING[num.pd] || NUM_DAY_MEANING[reduceNum(num.pd,false)] || {k:"Día", t:"Tomalo como guía suave."};
const monthKey = NUM_DAY_MEANING[num.pm] || {k:"Mes", t:"Tema del mes dentro de tu año personal."};
const yearKey = NUM_DAY_MEANING[num.py] || {k:"Año", t:"Tema del año personal."};

const interpNum = (
  <div className="space-y-3">
    <p className="text-sm">
      <strong>Clave del día ({num.pd}):</strong> {dayKey.k}. {dayKey.t}
    </p>
    <ul className="list-disc pl-5 space-y-1 text-sm">
      <li><strong>Mes personal ({num.pm}):</strong> {monthKey.k}. {monthKey.t}</li>
      <li><strong>Año personal ({num.py}):</strong> {yearKey.k}. {yearKey.t}</li>
      <li><strong>Consejo práctico:</strong> definí 1 acción alineada al día y 1 acción alineada al año (chiquitas, sostenibles).</li>
    </ul>
  </div>
);

const interpPlanet = planetHours.error ? (
  <p className="text-sm">No se pudo calcular la interpretación porque falta amanecer/atardecer. Revisá lat/lon y huso.</p>
) : (
  <div className="space-y-3">
    <p className="text-sm">
      Hoy el día está regido por <strong>{planetHours.lord}</strong>: {PLANET_KEYS[planetHours.lord] || "energía del planeta rector"}.
    </p>
    <ul className="list-disc pl-5 space-y-1 text-sm">
      <li><strong>Usalo para:</strong> planificar 1 actividad alineada (por ejemplo, Mercurio → papeles / Sol → visibilidad / Saturno → orden).</li>
      <li><strong>Tip:</strong> si una hora te cae “pesada”, bajá exigencia y hacé tareas mecánicas; si te cae “liviana”, aprovechá para lo importante.</li>
    </ul>
  </div>
);

const DASHA_KEYS = {
  Ketu:"Soltar, depurar, espiritualidad, cortar lo que no va.",
  Venus:"Vínculos, placer, valores, armonía, recursos.",
  Sun:"Identidad, autoridad, propósito, visibilidad.",
  Moon:"Emoción, hogar, cuidado, cambios internos.",
  Mars:"Acción, coraje, iniciativa, conflicto si se apura.",
  Rahu:"Deseo, ambición, expansión, lo nuevo (cuidar excesos).",
  Jupiter:"Crecimiento, aprendizaje, fe, oportunidades.",
  Saturn:"Disciplina, trabajo, límites, madurez.",
  Mercury:"Mente, negocios, comunicación, estudio.",
};

const interpJyotish = jyotish.error ? (
  <p className="text-sm">No se pudo calcular Jyotish: {jyotish.error}</p>
) : (
  <div className="space-y-3">
    <p className="text-sm">
      En védica, tu <strong>Sol sideral</strong> está en <strong>{jyotish.sunSign}</strong>.
      La <strong>nakshatra</strong> del momento es <strong>{jyotish.nakshatra?.name}</strong> (regente: {jyotish.nakshatra?.lord}).
    </p>
    <p className="text-sm">
      <strong>Mahadasha actual:</strong> {jyotish.mahadasha?.lord} → {DASHA_KEYS[jyotish.mahadasha?.lord] || "tema del planeta regente."}
    </p>
    <p className="text-xs text-gray-500">Interpretación general (sin ascendente/casas).</p>
  </div>
);

const interpHD = hd.error ? (
  <p className="text-sm">No se pudo calcular Human Design: {hd.error}</p>
) : (
  <div className="space-y-3">
    <p className="text-sm">
      Tu perfil estimado es <strong>{hd.profile}</strong>. Esto combina tus líneas consciente/inconsciente.
    </p>
    <ul className="list-disc pl-5 space-y-1 text-sm">
      <li><strong>{hd.gatePers?.line}:</strong> {HD_LINE[hd.gatePers?.line] || "—"}</li>
      <li><strong>{hd.gateDes?.line}:</strong> {HD_LINE[hd.gateDes?.line] || "—"}</li>
    </ul>
    <p className="text-xs text-gray-500">Gates por división uniforme → lectura del patrón activo.</p>
  </div>
);

const topDays = (() => {
  // Selecciona 3 días “favorables” por energía combinada simple
  const scored = dashboard.slice(0, 14).map(r => ({
    ...r,
    score: (r.bf*0.4) + (r.be*0.3) + (r.bi*0.3),
  })).sort((a,b)=>b.score-a.score);
  return scored.slice(0,3);
})();

const interp30 = (
  <div className="space-y-3">
    <p className="text-sm">En los próximos días, estos aparecen con mayor energía combinada:</p>
    <ul className="list-disc pl-5 space-y-1 text-sm">
      {topDays.map(d => (
        <li key={d.date}>
          <strong>{d.date}</strong>: físico {d.bf} • emocional {d.be} • intelectual {d.bi} • día personal {d.pd} • {d.seal}
        </li>
      ))}
    </ul>
    <p className="text-xs text-gray-500">Útil para planificar: dejá lo pesado para días más altos y lo liviano para días más bajos.</p>
  </div>
);


      return (
        <Shell page="cycles"><main id="main" className="cycles-page">
          <div className="flex flex-col gap-6">
            <header className="flex items-center justify-between gap-4">
              <div className="cycles-heading"><span className="eyebrow">TU UNIVERSO PERSONAL</span><h1>Una mirada a tus ciclos.</h1><p>Explora tus ritmos, encuentra un momento para ti.</p></div>
              <button className="px-3 py-2 rounded-xl bg-black text-white text-sm" onClick={()=>setDateStr(todayDateStr())}>Hoy</button>
            </header>

            <details id="perfil"><summary>◇ Mi perfil y ubicación · Editar datos</summary><Card title="Configuración" helpKey="configuracion" interpTitle="Cómo usar la configuración" interpContent={(
  <div className="space-y-2 text-sm">
    <p><strong>Idea:</strong> cargá tus datos una vez y luego cambiá la fecha objetivo para ver la lectura del día.</p>
    <ul className="list-disc pl-5 space-y-1">
      <li><strong>Nombre:</strong> afecta numerología (Expresión/Alma/Personalidad).</li>
      <li><strong>Nacimiento:</strong> define biorritmos y ciclos base.</li>
      <li><strong>Lat/Lon/TZ:</strong> afectan horas planetarias (amanecer/atardecer).</li>
      <li><strong>Fecha a calcular:</strong> cambia la lectura diaria (maya, numerología, horas planetarias).</li>
    </ul>
  </div>
)}>
<div className="grid md:grid-cols-3 gap-4">
                <Field label="Nombre completo">
                  <input className="rounded-xl border p-2" value={name} onChange={(e)=>setName(e.target.value)} />
                </Field>
                <Field label="Fecha de nacimiento">
                  <input type="date" className="rounded-xl border p-2" value={birthDate} onChange={(e)=>{if(validDate(e.target.value))setBirthDate(e.target.value);}} />
                </Field>
                <Field label="Hora de nacimiento (opcional)">
                  <input type="time" className="rounded-xl border p-2" value={birthTime} onChange={(e)=>setBirthTime(e.target.value)} />
                </Field>
                <Field label="Latitud (−34.86 Montevideo/Ciudad de la Costa)">
                  <input type="number" step="0.0001" className="rounded-xl border p-2" value={lat} min="-90" max="90" onChange={(e)=>setLat(e.target.value)} />
                </Field>
                <Field label="Longitud (−55.97)">
                  <input type="number" step="0.0001" className="rounded-xl border p-2" value={lon} min="-180" max="180" onChange={(e)=>setLon(e.target.value)} />
                </Field>
                <Field label="Huso horario (UYT = −3)">
                  <input type="number" step="0.25" min="-12" max="14" className="rounded-xl border p-2" value={tz} onChange={(e)=>setTz(e.target.value)} />
                </Field>
                <Field label="Fecha a calcular">
                  <input type="date" className="rounded-xl border p-2" value={dateStr} onChange={(e)=>{if(validDate(e.target.value))setDateStr(e.target.value);}} />
                </Field>
              </div>
              <p className="text-xs text-gray-500 mt-2">Tus datos se guardan en este navegador.</p>
              {!locationValid ? <p role="status" className="storage-notice">Completa una latitud entre −90 y 90, longitud entre −180 y 180 y huso entre −12 y 14.</p> : null}
              {saveError ? <p role="status" className="storage-notice">No se pudo guardar el perfil. Los cambios se conservarán solo mientras esta página permanezca abierta.</p> : null}
            </Card></details>
            <div className="cycle-date"><label htmlFor="target-date">Fecha de lectura</label><input id="target-date" type="date" value={dateStr} onChange={e=>{if(validDate(e.target.value))setDateStr(e.target.value);}}/><span className="muted">Interpretaciones simbólicas para explorar, no predicciones.</span></div>

            <div className="grid md:grid-cols-3 gap-4">
              <Card title="Resumen rápido" helpKey="resumen" interpTitle="Cómo leer el resumen" interpContent={(
  <div className="space-y-2 text-sm">
    <p>Usá este bloque como “vista panorámica”. Si algo te resuena, bajá al módulo correspondiente.</p>
    <ul className="list-disc pl-5 space-y-1">
      <li><strong>Occidental/Chino:</strong> marcos generales (no dependen de la fecha objetivo).</li>
      <li><strong>Maya (fecha objetivo):</strong> foco energético del día.</li>
      <li><strong>Runas:</strong> arquetipos activos del campo personal.</li>
    </ul>
  </div>
)}>
<ul className="text-sm leading-7">
                  <li><strong>Occidental (Sol):</strong> {occidental}</li>
                  <li><strong>Chino:</strong> {chino.animal} de {chino.element}</li>
                  <li><strong>Maya ({dateStr}):</strong> Tono {maya.tone} – {maya.toneDesc} | {maya.seal}</li>
                  <li><strong>Runa natal:</strong> {runes.natal.name} – {runes.natal.meaning}</li>
                  <li><strong>Runa {target.getFullYear()}:</strong> {runes.year.name} – {runes.year.meaning}</li>
                </ul>
              </Card>

              <Card title={`Biorritmos · ${dateStr}`} helpKey="biorritmos" interpContent={interpBio}>
                {[["Físico", bio.physical],["Emocional", bio.emotional],["Intelectual", bio.intellectual]].map(([k,v])=> (
                  <div key={k} className="mb-3">
                    <div className="flex justify-between text-sm"><span>{k}</span><span>{v}%</span></div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-red-400 to-green-500" style={{ width: `${Math.max(0, v + 100) / 2}%` }} />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500">Lectura del ciclo activo</p>
              </Card>

              <Card title="Numerología (fecha objetivo)" helpKey="numerologia" interpContent={interpNum}>
                <ul className="text-sm leading-7">
                  <li><strong>Camino de Vida:</strong> {num.lp}</li>
                  <li><strong>Destino/Expresión:</strong> {num.exp}</li>
                  <li><strong>Urgencia del Alma:</strong> {num.soul}</li>
                  <li><strong>Personalidad:</strong> {num.pers}</li>
                  <li><strong>Madurez:</strong> {num.mat}</li>
                  <li><strong>Año Personal:</strong> {num.py}</li>
                  <li><strong>Mes Personal:</strong> {num.pm}</li>
                  <li><strong>Día Personal:</strong> {num.pd}</li>
                </ul>
              </Card>
            </div>

            <Card title={`Horas planetarias – ${dateStr}`} helpKey="horas" interpContent={interpPlanet}>
              {planetHours.error ? (
                <p className="text-sm text-red-600">{planetHours.error} • Verifica lat/lon y huso horario.</p>
              ) : (
                <>
                  <p className="text-sm mb-2">Día regido por: <strong>{planetHours.lord || "—"}</strong> (1ª hora del día).</p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left border-b"><th className="py-2 pr-2">#</th><th className="py-2 pr-2">Planeta</th><th className="py-2 pr-2">Fase</th><th className="py-2 pr-2">Inicio</th><th className="py-2 pr-2">Fin</th></tr>
                      </thead>
                      <tbody>
                        {planetHours.rows.map((r) => (
                          <tr key={r.idx} className="border-b last:border-0">
                            <td className="py-1 pr-2">{r.idx}</td>
                            <td className="py-1 pr-2">{r.planet}</td>
                            <td className="py-1 pr-2">{r.phase}</td>
                            <td className="py-1 pr-2">{fmtHM(r.start)}</td>
                            <td className="py-1 pr-2">{fmtHM(r.end)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Cálculo operativo: amanecer/atardecer + huso fijo. Uruguay sin DST desde 2015.</p>
                </>
              )}
            </Card>

            <Card title="Jyotish (védica)" helpKey="jyotish" interpContent={interpJyotish}>
              {jyotish.error ? (
                <p className="text-sm text-red-600">{jyotish.error}</p>
              ) : (
                <ul className="text-sm leading-7">
                  <li><strong>Ayanamsa (Lahiri):</strong> {jyotish.ayan?.toFixed(3)}°</li>
                  <li><strong>Sol sideral:</strong> {jyotish.sunSign} ({jyotish.lonSunSid?.toFixed(2)}°)</li>
                  <li><strong>Luna sideral:</strong> {jyotish.lonMoonSid?.toFixed(2)}°</li>
                  <li><strong>Nakshatra:</strong> {jyotish.nakshatra?.name} — Pada {jyotish.nakshatra?.pada} (regente: {jyotish.nakshatra?.lord})</li>
                  <li><strong>Mahadasha actual:</strong> {jyotish.mahadasha?.lord} {jyotish.mahadasha?.from?.toISOString().slice(0,10)} → {jyotish.mahadasha?.to?.toISOString().slice(0,10)}</li>
                </ul>
              )}
              <p className="text-xs text-gray-500 mt-2">Para Ascendente y casas, integrar Swiss Ephemeris o un cálculo de casas sidéreas.</p>
            </Card>

            <Card title="Human Design (básico)" helpKey="hd" interpContent={interpHD}>
              {hd.error ? (
                <p className="text-sm text-red-600">{hd.error}</p>
              ) : (
                <ul className="text-sm leading-7">
                  <li><strong>Fecha de Diseño:</strong> {hd.designDate?.toISOString().slice(0,10)}</li>
                  <li><strong>Sol Personalidad:</strong> {hd.gatePers?.gate} línea {hd.gatePers?.line}</li>
                  <li><strong>Sol Diseño:</strong> {hd.gateDes?.gate} línea {hd.gateDes?.line}</li>
                  <li><strong>Perfil:</strong> {hd.profile}</li>
                </ul>
              )}
              <p className="text-xs text-gray-500 mt-2">Nota: mapeo de gates por división uniforme. Para exactitud usa el mandala oficial (hdkit).</p>
            </Card>

            <Card title="Próximos 30 días (biorritmos + numerología + maya)" helpKey="tabla30" interpContent={interp30}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b"><th className="py-2 pr-2">Fecha</th><th className="py-2 pr-2">Físico %</th><th className="py-2 pr-2">Emocional %</th><th className="py-2 pr-2">Intelectual %</th><th className="py-2 pr-2">Día Pers.</th><th className="py-2 pr-2">Tono</th><th className="py-2 pr-2">Sello</th></tr>
                  </thead>
                  <tbody>
                    {dashboard.map((row) => (
                      <tr key={row.date} className="border-b last:border-0">
                        <td className="py-1 pr-2 whitespace-nowrap">{row.date}</td>
                        <td className="py-1 pr-2">{row.bf}</td>
                        <td className="py-1 pr-2">{row.be}</td>
                        <td className="py-1 pr-2">{row.bi}</td>
                        <td className="py-1 pr-2">{row.pd}</td>
                        <td className="py-1 pr-2">{row.tone}</td>
                        <td className="py-1 pr-2">{row.seal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">Lectura integrada del ciclo energético, mental y operativo de los próximos días.</p>
            </Card>

            <footer className="text-xs text-gray-500 text-center pt-4">Las lecturas de Jyotish y Human Design conservan los cálculos aproximados de la versión anterior.</footer>
          </div>
        </main></Shell>
      );
    }

    if (typeof document !== 'undefined') createRoot(document.getElementById('root')).render(<App />);
  