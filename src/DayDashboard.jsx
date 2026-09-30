import React, {useEffect, useRef, useState} from 'react';
import {Shell} from './Shell';
import LifeClock from './LifeClock';
import {GeneralReading,TarotCard} from './GeneralAndTarot';
import Icon from './Icon';
import './dashboard.css';
export function BioRing({label,value,icon}){
  return <div className="day-ring" role="img" aria-label={`${label}: ${value>0?'+':''}${Math.round(value)} por ciento, ciclo simbólico`}><svg viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="62" className="ring-outline"/><circle cx="70" cy="70" r="56" className="ring-track"/><circle cx="70" cy="70" r="56" className="ring-value" pathLength="100" strokeDasharray={`${(value+100)/2} 100`} transform="rotate(-90 70 70)"/></svg><div><Icon name={icon}/><strong>{value>0?'+':''}{Math.round(value)}</strong><span>{label}</span></div></div>;
}
export default function DayDashboard({profile,overview,context,bio}){
  const panel=useRef(null),lastFocus=useRef(null);
  const [view,setView]=useState('summary');
  const close=()=>{setView('summary');requestAnimationFrame(()=>lastFocus.current?.focus());};
  function showReading(conversation=false){
    lastFocus.current=document.activeElement;
    setView(conversation?'conversation':'reading');
  }
  useEffect(()=>{
    if(view==='summary')return;
    panel.current?.scrollIntoView({block:'start',behavior:'instant'});
    if(view==='conversation'){
      const details=panel.current?.querySelector('.reading-conversation');
      if(details){details.open=true;details.querySelector('textarea')?.focus({preventScroll:true});}
    }else panel.current?.querySelector('.day-back')?.focus({preventScroll:true});
  },[view]);
  useEffect(()=>{
    function navigate(){
      if(location.hash==='#conversar')showReading(true);
      else if(location.hash==='#lectura')showReading();
      else if(location.hash==='#carta'){document.getElementById('day-card')?.scrollIntoView({block:'center'});document.querySelector('#day-card button')?.focus({preventScroll:true});}
    }
    navigate();window.addEventListener('hashchange',navigate);return()=>window.removeEventListener('hashchange',navigate);
  },[]);
  const firstName=profile.name.trim().split(' ')[0] || 'a tu espacio';
  const date=new Date(`${context.slice(0,10)}T12:00:00`);
  return <Shell page="day"><main id="main" className="day-dashboard">
    <header className="day-header"><div><h1>Buen día, {firstName}</h1><p>Un espacio para escucharte y encontrar tu ritmo.</p></div><div className="day-profile"><span>{date.toLocaleDateString('es-UY',{day:'numeric',month:'long'})}</span><a href="/ciclos.html#perfil" aria-label="Abrir mi perfil">{firstName[0]}</a></div></header>
    <LifeClock profile={profile} compact/>
    <div className="day-grid">
      <section ref={panel} className={`day-hero ${view!=='summary'?'day-hero-expanded':''}`}><div hidden={view!=='summary'} className="day-hero-summary"><span className="eyebrow">TU LECTURA DE HOY</span><h2>{overview.title}</h2><p>{overview.action} No hace falta resolverlo todo a la vez: puedes empezar por aquello que tenga sentido para ti.</p><div className="day-hero-actions"><button className="button primary" onClick={()=>showReading(true)}><Icon name="chat"/>Conversar sobre mi lectura</button><button className="button secondary-outline" onClick={()=>showReading()}>Ver lectura completa</button></div><span className="day-ai-mark">✧ Lectura con DeepSeek disponible</span></div><div hidden={view==='summary'} className={`day-inline-reading ${view==='conversation'?'conversation-view':''}`}><div className="day-inline-top"><span className="eyebrow">TU LECTURA DE HOY</span><button className="button secondary-outline day-back" onClick={close}>← Volver al resumen</button></div><h2>{view==='conversation'?'Conversemos sobre tu día':'Tu lectura completa'}</h2><button className="day-view-toggle" onClick={()=>setView(view==='conversation'?'reading':'conversation')}>{view==='conversation'?'Consultar la lectura completa':'Ir a la conversación'}</button><GeneralReading reading={overview} context={context}/></div></section>
      <div id="day-card" className="day-card"><TarotCard context={context} sources={overview.sources} compact/></div>
      <section className="day-cycles"><div className="day-section-title"><h2>Tus ciclos, de un vistazo</h2><span>ⓘ Lectura simbólica</span></div><div className="day-rings"><BioRing label="Físico" icon="leaf" value={bio.physical}/><BioRing label="Emocional" icon="heart" value={bio.emotional}/><BioRing label="Intelectual" icon="spark" value={bio.intellectual}/></div><a className="day-link" href="/ciclos.html">Explorar los métodos <Icon name="arrow"/></a></section>
      <section className="day-visual"><h2>Tu visualización</h2><div className="day-visual-content"><svg viewBox="0 0 100 200" className="day-body" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="50" cy="22" r="12"/><path d="M42 35 29 47 17 102l7 3 18-46-4 47-8 75 10 3 10-60 10 60 10-3-8-75-4-47 18 46 7-3-12-55-13-12Z"/><path d="m42 35 16 24-20 47 24 0-20-47 16-24M29 47l42 0M38 106l12 18 12-18"/>{[[50,22],[42,35],[58,35],[29,47],[71,47],[50,70],[38,106],[62,106],[50,124],[32,171],[68,171],[22,93],[78,93]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="2" fill="currentColor"/>)}</svg><div><p>Un recorrido visual para conectar con tu momento actual.</p><a className="button primary" href="/visualizacion.html">Iniciar recorrido</a></div></div></section>
    </div>
    <button className="day-chat-shortcut" onClick={()=>showReading(true)}><Icon name="chat"/><span>¿Qué te gustaría comprender hoy?</span><i><Icon name="arrow"/></i></button>

  </main></Shell>;
}
