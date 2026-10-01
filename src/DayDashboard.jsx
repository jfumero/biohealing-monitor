import React, {useEffect, useRef, useState} from 'react';
import {Shell} from './Shell';
import LifeClock from './LifeClock';
import DailyReading from './DailyReading';
import {dailyIdentity,readDaily,saveDaily} from './daily-session';
import {TAROT} from './tarot';
import Icon from './Icon';
import './dashboard.css';
export function BioRing({label,value,icon}){
  return <div className="day-ring" role="img" aria-label={`${label}: ${value>0?'+':''}${Math.round(value)} por ciento, ciclo simbólico`}><svg viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="62" className="ring-outline"/><circle cx="70" cy="70" r="56" className="ring-track"/><circle cx="70" cy="70" r="56" className="ring-value" pathLength="100" strokeDasharray={`${(value+100)/2} 100`} transform="rotate(-90 70 70)"/></svg><div><Icon name={icon}/><strong>{value>0?'+':''}{Math.round(value)}</strong><span>{label}</span></div></div>;
}
export default function DayDashboard({profile,overview,context,bio}){
  const identity=dailyIdentity(profile,context.slice(0,10));
  const [session,setSession]=useState(()=>readDaily(identity));
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[storageError,setStorageError]=useState(false);
  const panel=useRef(null);
  function save(next){setSession(next);setStorageError(!saveDaily(next));}
  function showReading(){panel.current?.scrollIntoView({block:'start',behavior:'smooth'});panel.current?.querySelector('h2')?.focus({preventScroll:true});}
  useEffect(()=>{
    function navigate(){if(['#conversar','#lectura','#carta'].includes(location.hash))showReading();}
    navigate();window.addEventListener('hashchange',navigate);return()=>window.removeEventListener('hashchange',navigate);
  },[]);
  const firstName=profile.name.trim().split(' ')[0] || 'a tu espacio';
  const date=new Date(`${context.slice(0,10)}T12:00:00`);
  return <Shell page="day"><main id="main" className="day-dashboard">
    <header className="day-header"><div><h1>Buen día, {firstName}</h1><p>Un espacio para escucharte y encontrar tu ritmo.</p></div><div className="day-profile"><span>{date.toLocaleDateString('es-UY',{day:'numeric',month:'long'})}</span><a href="/ciclos.html#perfil" aria-label="Abrir mi perfil">{firstName[0]}</a></div></header>
    <LifeClock profile={profile} compact/>
    <div className="day-grid">
      <section ref={panel} className={`day-hero ${session?'day-hero-expanded':''}`}><DailyReading session={session} save={save} identity={identity} context={context} overview={overview} busy={busy} setBusy={setBusy} error={error} setError={setError} storageError={storageError}/></section>
      <aside id="day-card" className="day-card daily-companion"><h2>Tu carta de hoy</h2><div className="tarot-face tarot-back" aria-hidden="true"><b>{session?TAROT[session.cardId].symbol:'☾'}</b><strong>{session?TAROT[session.cardId].name:'Una nueva mirada'}</strong></div><p>{session?'Una parte de tu lectura, junto con tus nueve métodos.':'Tu carta aparecerá al descubrir tu día.'}</p></aside>
      <section className="day-cycles"><div className="day-section-title"><h2>Tus ciclos, de un vistazo</h2><span>ⓘ Lectura simbólica</span></div><div className="day-rings"><BioRing label="Físico" icon="leaf" value={bio.physical}/><BioRing label="Emocional" icon="heart" value={bio.emotional}/><BioRing label="Intelectual" icon="spark" value={bio.intellectual}/></div><a className="day-link" href="/ciclos.html">Explorar los métodos <Icon name="arrow"/></a></section>
      <section className="day-visual"><h2>Tu visualización</h2><div className="day-visual-content"><svg viewBox="0 0 100 200" className="day-body" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="50" cy="22" r="12"/><path d="M42 35 29 47 17 102l7 3 18-46-4 47-8 75 10 3 10-60 10 60 10-3-8-75-4-47 18 46 7-3-12-55-13-12Z"/><path d="m42 35 16 24-20 47 24 0-20-47 16-24M29 47l42 0M38 106l12 18 12-18"/>{[[50,22],[42,35],[58,35],[29,47],[71,47],[50,70],[38,106],[62,106],[50,124],[32,171],[68,171],[22,93],[78,93]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="2" fill="currentColor"/>)}</svg><div><p>Un recorrido visual para conectar con tu momento actual.</p><a className="button primary" href="/visualizacion.html">Iniciar recorrido</a></div></div></section>
    </div>


  </main></Shell>;
}
