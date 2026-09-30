import { GeneralReading, TarotCard } from './GeneralAndTarot';
import { generalReading } from './general-reading';
import MomentReading from './MomentReading';
import { bioReading, numberReading, numberTheme, mayaReading, planetReading, jyotishReading, hdReading, agendaReading, westernReading, chineseReading } from './moment-readings';
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

          {interpContent && helpKey === "configuracion" && (
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
      {interpContent && helpKey !== "configuracion" && <div>{interpContent}</div>}

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

export function App(){
      const [initial] = useState(readProfile);
      const [name,setName]=useState(initial.name);
      const [birthDate,setBirthDate]=useState(initial.birthDate);
      const [birthTime,setBirthTime]=useState(initial.birthTime);
      const [lat,setLat]=useState(initial.lat);
      const [lon,setLon]=useState(initial.lon);
      const [tz,setTz]=useState(initial.tz);
      const [birthUtcOffset,setBirthUtcOffset]=useState(initial.birthUtcOffset);
      const [conceptionDate,setConceptionDate]=useState(initial.conceptionDate);
      const [dateStr,setDateStr]=useState(()=>new Date(Date.now()+initial.tz*3600000).toISOString().slice(0,10));
      const [readingTime,setReadingTime]=useState(()=>new Date(Date.now()+initial.tz*3600000).toISOString().slice(11,16));
      const [saveError,setSaveError]=useState(false);
      const locationValid = lat !== '' && lon !== '' && tz !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lon)) && Number.isFinite(Number(tz)) && Number(lat)>=-90 && Number(lat)<=90 && Number(lon)>=-180 && Number(lon)<=180 && Number(tz)>=-12 && Number(tz)<=14;
      useEffect(()=>{
        if(locationValid) setSaveError(!writeProfile({name,birthDate,birthTime,lat,lon,tz,birthUtcOffset,conceptionDate,birthTimeRevision:1}));
      },[name,birthDate,birthTime,lat,lon,tz,birthUtcOffset,conceptionDate,locationValid]);
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
      const target=useMemo(()=> new Date(`${dateStr}T${readingTime}:00`),[dateStr,readingTime]);
      const birthInstant=useMemo(()=>new Date(+new Date(`${birthDate}T${birthTime || "00:00"}:00Z`) - Number(birthUtcOffset)*3600000),[birthDate,birthTime,birthUtcOffset]);
      const targetInstant=useMemo(()=>new Date(+new Date(`${dateStr}T${readingTime}:00Z`) - Number(tz)*3600000),[dateStr,readingTime,tz]);

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
          const ayan=ayanamsaLahiri(targetInstant);
          const lonSunTrop=eclipticLongitude(Astro.Body.Sun, targetInstant);
          const lonMoonTrop=eclipticLongitude(Astro.Body.Moon, targetInstant);
          const lonSunSid=siderealLongitude(lonSunTrop, ayan);
          const lonMoonSid=siderealLongitude(lonMoonTrop, ayan);
          const nk=nakshatraFromLon(lonMoonSid);

          const moonBirthSid=siderealLongitude(
            eclipticLongitude(Astro.Body.Moon, birthInstant),
            ayanamsaLahiri(birthInstant)
          );
          const md=currentMahadasha(birthInstant, targetInstant, moonBirthSid);

          const sidSigns=["Aries","Tauro","Géminis","Cáncer","Leo","Virgo","Libra","Escorpio","Sagitario","Capricornio","Acuario","Piscis"];
          const sunSign=sidSigns[Math.floor(lonSunSid/30)];

          return { ayan, lonSunSid, lonMoonSid, sunSign, nakshatra:nk, mahadasha:md };
        }catch(e){ return { error:e?.message || String(e) }; }
      },[birthInstant,targetInstant]);

      // Human Design (básico) – corregido
      const hd=useMemo(()=>{
        try{
          const designDate=findDesignDate(birthInstant);
          const sunPers=eclipticLongitude(Astro.Body.Sun, birthInstant);
          const sunDesi=eclipticLongitude(Astro.Body.Sun, designDate);
          const gP=gateFromDegreesUniform(sunPers);
          const gD=gateFromDegreesUniform(sunDesi);
          const profile=`${gP.line}/${gD.line}`;
          return { designDate, sunPers, sunDesi, gatePers:gP, gateDes:gD, profile, note:"Para gates exactos usa el mandala oficial (hdkit)." };
        }catch(e){ return { error:e?.message || String(e) }; }
      },[birthInstant]);

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

const overview = generalReading({num,bio,maya,sealIndex:tzNames.indexOf(maya.seal),runes,occidental,chino,jyotish,hd,planetHours,target});
const readingContext = `${dateStr} ${readingTime} (UTC${Number(tz)>=0?'+':''}${tz})`;
const interpBio = <MomentReading reading={bioReading(bio)} />;
const interpNum = <><MomentReading reading={numberReading(num)} /><details className="mt-3"><summary>Mis números natales en esta lectura</summary>{[["Camino de vida",num.lp],["Expresión",num.exp],["Alma",num.soul],["Personalidad",num.pers],["Madurez",num.mat]].map(([label,n])=><p key={label} className="text-sm mt-2"><strong>{label} {n} · {numberTheme(n)[0]}:</strong> {numberTheme(n)[1]} En la fecha elegida, relaciónalo con el foco de {numberTheme(num.pd)[0]}.</p>)}</details></>;
const interpPlanet = <MomentReading reading={planetReading(planetHours,target)} />;
const interpJyotish = <MomentReading reading={jyotishReading(jyotish)} />;
const interpHD = <MomentReading reading={hdReading(hd,num.pd)} />;
const interp30 = <p className="reading-caption mt-3">Cada fecha incluye una propuesta basada en su día personal. Las curvas son referencias simbólicas, no un pronóstico de energía ni un ranking de días mejores o peores.</p>;
const summaryReading = <>
  <MomentReading reading={mayaReading(maya,tzNames.indexOf(maya.seal))} />
  <MomentReading reading={{title:`Runas · ${runes.year.name} en ${target.getFullYear()}`,text:`La runa anual calculada reúne estos temas: ${runes.year.meaning}. Tu runa natal ${runes.natal.name} aporta ${runes.natal.meaning.toLowerCase()}. ${runes.year.name===runes.natal.name?'En este cálculo coinciden: puedes profundizar en un solo tema.':'La propuesta es explorar cómo se complementan ambos símbolos.'}`,action:`Elige una de esas palabras y escribe una situación concreta donde aparezca. Relaciónala con el foco de ${numberTheme(num.pd)[0]} del día.`,question:'¿Qué respuesta propia encuentro al mirar esta situación desde ese símbolo?'}} />
  <MomentReading reading={westernReading(occidental,num.pd)} />
  <MomentReading reading={chineseReading(chino,num.pd)} />
</>;

      return (
        <Shell page="cycles"><main id="main" className="cycles-page">
          <div className="flex flex-col gap-6">
            <header className="flex items-center justify-between gap-4">
              <div className="cycles-heading"><span className="eyebrow">TU UNIVERSO PERSONAL</span><h1>Una mirada a tus ciclos.</h1><p>Explora tus ritmos, encuentra un momento para ti.</p></div>
              <button className="px-3 py-2 rounded-xl bg-black text-white text-sm" onClick={()=>{const now=new Date(Date.now()+Number(tz)*3600000);setDateStr(now.toISOString().slice(0,10));setReadingTime(now.toISOString().slice(11,16));}}>Ahora</button>
            </header>

            <section className="reading-context" aria-label="Momento de la lectura">
              <h2>Tu lectura del momento</h2>
              <label>Fecha de la lectura<input type="date" value={dateStr} onChange={e=>{if(validDate(e.target.value))setDateStr(e.target.value);}} /></label>
              <label>Hora de la lectura<input type="time" value={readingTime} onChange={e=>{if(e.target.value)setReadingTime(e.target.value);}} /></label>
              <p>Lecturas simbólicas para reflexionar sobre {dateStr} a las {readingTime} (UTC{Number(tz)>=0?'+':''}{tz}). Cambia el momento para explorar otra lectura. Los datos natales permanecen como referencia.</p>
            </section>
            <GeneralReading reading={overview} context={readingContext} />
            <TarotCard context={readingContext} sources={overview.sources} />
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
                <Field label="Hora de nacimiento">
                  <input type="time" className="rounded-xl border p-2" value={birthTime} onChange={(e)=>setBirthTime(e.target.value)} />
                </Field>
                <Field label="Huso al nacer (UTC; Uruguay suele ser −3)">
                  <input type="number" step="0.25" min="-12" max="14" className="rounded-xl border p-2" value={birthUtcOffset} onChange={(e)=>{const n=Number(e.target.value);if(e.target.value!=='' && n>=-12 && n<=14)setBirthUtcOffset(n);}} />
                </Field>
                <Field label="Concepción estimada (opcional)">
                  <input type="date" max={birthDate} className="rounded-xl border p-2" value={conceptionDate} onChange={(e)=>{const v=e.target.value;if(!v || (validDate(v) && v<=birthDate))setConceptionDate(v);}} />
                  <small>Vacío: 266 días antes del nacimiento. Ajusta el huso histórico si lo conoces.</small>
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
            <div className="cycle-date"><label htmlFor="target-date">Fecha de lectura</label><input id="target-date" type="date" value={dateStr} onChange={e=>{if(validDate(e.target.value))setDateStr(e.target.value);}}/><span className="muted">Elige un día para explorar tus ciclos.</span></div>

            <div className="grid md:grid-cols-3 gap-4">
              <Card title="Resumen rápido" helpKey="resumen" interpContent={summaryReading}>
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
                <p className="text-xs text-gray-500">Curvas simbólicas del ciclo; no son mediciones de tu estado físico o emocional</p>
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
                  <li><strong>Sol sideral del momento:</strong> {jyotish.sunSign} ({jyotish.lonSunSid?.toFixed(2)}°)</li>
                  <li><strong>Luna sideral:</strong> {jyotish.lonMoonSid?.toFixed(2)}°</li>
                  <li><strong>Nakshatra:</strong> {jyotish.nakshatra?.name} — Pada {jyotish.nakshatra?.pada} (regente: {jyotish.nakshatra?.lord})</li>
                  <li><strong>Mahadasha actual:</strong> {jyotish.mahadasha?.lord} {jyotish.mahadasha?.from?.toISOString().slice(0,10)} → {jyotish.mahadasha?.to?.toISOString().slice(0,10)}</li>
                </ul>
              )}
              <p className="text-xs text-gray-500 mt-2">Lectura general del momento y del período natal, sin ascendente ni casas.</p>
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
              <p className="text-xs text-gray-500 mt-2">Aproximación exploratoria: no determina tu tipo, estrategia ni autoridad de Human Design.</p>
            </Card>

            <Card title="Próximos 30 días (biorritmos + numerología + maya)" helpKey="tabla30" interpContent={interp30}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b"><th className="py-2 pr-2">Fecha</th><th className="py-2 pr-2">Físico %</th><th className="py-2 pr-2">Emocional %</th><th className="py-2 pr-2">Intelectual %</th><th className="py-2 pr-2">Día Pers.</th><th className="py-2 pr-2">Tono</th><th className="py-2 pr-2">Sello</th><th className="py-2 pr-2">Propuesta para el día</th></tr>
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
                        <td className="py-1 pr-2">{row.seal}</td><td className="reading-agenda">{agendaReading(row)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">Lectura integrada del ciclo energético, mental y operativo de los próximos días.</p>
            </Card>


          </div>
        </main></Shell>
      );
    }

    if (typeof document !== 'undefined') createRoot(document.getElementById('root')).render(<App />);

