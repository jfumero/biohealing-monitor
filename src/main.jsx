import React, { useEffect, useReducer, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Shell } from './Shell';
import Gauge from './Gauge';
import LifeClock from './LifeClock';
import NanobotScene from './NanobotScene';
import { ageYears, birthFromProfile, biorhythm, readProfile, zodiac } from './profile';
import { MODULES, QUEUE, SESSION_SECONDS, INITIAL_SESSION, sessionReducer, progress } from './session';
import musicUrl from '../music.mp3';
import './theme.css';

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id); }, []);
  return now;
}
function ModuleCard({module, sessionValue, sessionActive, quiet}) {
  const [value, setValue] = useState(0);
  const [active, setActive] = useState(false);
  const [individual, setIndividual] = useState(false);
  useEffect(() => {
    if (!active || sessionActive) return;
    const id = setInterval(() => setValue(v => Math.min(100, v + 2)), 120);
    return () => clearInterval(id);
  }, [active, sessionActive]);
  useEffect(() => { if (value >= 100) setActive(false); }, [value]);
  useEffect(() => { if (sessionActive) { setActive(false); setValue(0); setIndividual(false); } }, [sessionActive]);
  const displayed = individual && !sessionActive ? value : sessionValue ?? value;
  return <article className="module-card panel">
    <div className="module-top"><span className="module-icon" aria-hidden="true">{module.icon}</span><span>{module.detail}</span></div>
    <h3>{module.title}</h3><Gauge value={displayed} label={`${module.title}: progreso de sesión`} active={!quiet&&(active||sessionActive)}/>
    <div className="module-bottom"><span className="module-status"><i className={`status-dot ${active||sessionActive?'lit':''}`}/>{displayed>=100?'Completado':active||sessionActive?'En curso':'En espera'}</span>
      <button className="text-button" disabled={sessionActive} onClick={() => { if(active) setActive(false); else {setValue(0);setIndividual(true);setActive(true);} }} aria-label={`${active?'Pausar':'Activar'} ${module.title}`}>{active?'Pausar':'Activar'} <span aria-hidden="true">↗</span></button></div>
  </article>;
}
export function App() {
  const [profile, setProfile] = useState(readProfile);
  const [target, setTarget] = useState('whole');
  const [session, dispatch] = useReducer(sessionReducer, INITIAL_SESSION);
  const [sound, setSound] = useState(false);
  const [quiet, setQuiet] = useState(() => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const [audioError, setAudioError] = useState('');
  const audioRef = useRef(null);
  const now = useClock();
  const running = session.status === 'running';
  const engaged = running || session.status === 'paused';
  const pct = progress(session.elapsed);
  const birth = birthFromProfile(profile);
  useEffect(() => {
    const sync = () => setProfile(readProfile());
    window.addEventListener('storage', sync); window.addEventListener('focus', sync);
    return () => { window.removeEventListener('storage',sync); window.removeEventListener('focus',sync); };
  }, []);
  useEffect(() => {
    if (!running) return;
    let previous = performance.now();
    const id = setInterval(() => { const current = performance.now(); dispatch({type:'tick', seconds:(current-previous)/1000}); previous=current; }, 100);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    const audio = audioRef.current;
    const sync = () => {
      if (running && sound && !document.hidden) { audio.volume=.16; audio.play().catch(() => {setSound(false);setAudioError('No se pudo reproducir el audio. Puedes continuar en silencio.');}); }
      else audio.pause();
    };
    sync(); document.addEventListener('visibilitychange',sync);
    return () => { audio.pause(); document.removeEventListener('visibilitychange',sync); };
  }, [running,sound]);
  const stepIndex = Math.min(QUEUE.length-1, Math.floor(pct/100*QUEUE.length));
  const stateLabel = {idle:'Listo para comenzar',running:'Sesión en curso',paused:'Sesión en pausa',cancelled:'Sesión finalizada',complete:'Enjambre en vigilancia'}[session.status];
  return <Shell><main id="main" className={`monitor ${quiet?'quiet':''}`}>
    <header className="topbar"><span className="breadcrumb">Tu espacio <span>/</span> <strong>Monitor</strong></span><div className="topbar-profile"><span className="avatar">{profile.name.trim().slice(0,1)||'B'}</span><span>{profile.name||'Mi perfil'}</span><a href="/ciclos.html#perfil" aria-label="Editar perfil">↗</a></div></header>
    <section className="page-heading"><div><div className="eyebrow">BIENVENIDO A TU ESPACIO</div><h1>Conecta. Respira. <em>Equilibra.</em></h1><p>Tu momento de calma, con una nueva perspectiva.</p></div><div className="date-block"><span>{now.toLocaleDateString('es-UY',{weekday:'long',day:'numeric',month:'long'})}</span><strong>{now.toLocaleTimeString('es-UY',{hour:'2-digit',minute:'2-digit'})}</strong></div></section>
    <LifeClock profile={profile} quiet={quiet} />
    <section className="hero-grid" aria-label="Sesión y resumen personal">
      <div className="session-info"><div className="eyebrow"><i className={`status-dot ${running?'lit':''}`}/>{stateLabel}</div><h2>Un pequeño ritual.<br/><span>Todo tu universo.</span></h2><p>Despliega tu enjambre, sigue sus caminos de luz y dedica 60 segundos a tu mundo interior.</p><div className="session-buttons">
        <button className="button primary" onClick={() => dispatch({type:running?'pause':session.status==='paused'?'resume':'start'})}><span aria-hidden="true">{running?'Ⅱ':'▷'}</span>{running?'Pausar sesión':session.status==='paused'?'Continuar sesión':'Iniciar sesión'}</button>
        {engaged ? <button className="button subtle" onClick={() => dispatch({type:'cancel'})}>Finalizar</button> : null}
      </div><div className="session-meta"><span>◷ {Math.max(0,Math.ceil(SESSION_SECONDS-session.elapsed))} s {engaged?'restantes':'de duración'}</span><span>✧ Misión interior</span></div>
      <div className="session-settings"><button className={sound?'setting selected':'setting'} aria-pressed={sound} onClick={() => {setSound(s=>!s);setAudioError('');}}>{sound?'♫ Sonido activado':'♪ Sin sonido'}</button><button className={quiet?'setting selected':'setting'} aria-pressed={quiet} onClick={() => setQuiet(q=>!q)}>◌ Modo tranquilo</button></div>{audioError ? <p role="status">{audioError}</p> : null}</div>
      <div className="hero-instrument"><div className="gauge-orbit" aria-hidden="true"/><Gauge value={pct} label="Progreso general de la sesión" large active={running&&!quiet}/><div className="instrument-caption"><span className="eyebrow">PROGRESO GENERAL</span><p>{running?QUEUE[stepIndex]:stateLabel}</p></div></div>
      <aside className="daily-summary panel"><div className="eyebrow">TU PULSO DEL DÍA <span aria-hidden="true">✧</span></div><h3>Ciclos personales</h3><p className="muted">Una mirada a tus ritmos personales.</p><div className="bio-list">{[['Físico',23,'ϟ'],['Emocional',28,'♡'],['Intelectual',33,'✧']].map(([name,period,icon])=>{const v=biorhythm(birth,now,period);return <div className="bio-row" key={name}><div><span><b aria-hidden="true">{icon}</b> {name}</span><strong>{v>0?'+':''}{Math.round(v)}%</strong></div><div className="bio-track"><span style={{width:`${(v+100)/2}%`}}/></div></div>;})}</div><div className="profile-facts"><span>{zodiac(birth)}</span><span>{ageYears(birth,now)} años</span></div><a className="text-button" href="/ciclos.html">Explorar mis ciclos <span aria-hidden="true">↗</span></a></aside>
    </section>
    <NanobotScene session={session} quiet={quiet} target={target} onTarget={setTarget} onStart={()=>dispatch({type:session.status==='paused'?'resume':'start'})} onPause={()=>dispatch({type:'pause'})} onFinish={()=>dispatch({type:'cancel'})}/>
    <section className="session-strip panel" aria-label="Estado de sesión"><span className="strip-symbol" aria-hidden="true">⌁</span><div><strong>{stateLabel}</strong><span>{session.status==='complete'?'El recorrido terminó. Las unidades permanecen distribuidas por el mapa en vigilancia.':session.status==='paused'?'Continúa cuando estés listo. Tu progreso se conserva.':session.status==='cancelled'?'Puedes comenzar una nueva sesión cuando quieras.':running?`Paso ${stepIndex+1} de ${QUEUE.length} · ${QUEUE[stepIndex]}`:'Tu enjambre está listo. Elige una zona y comienza tu recorrido.'}</span></div><div className="strip-progress"><span>{Math.round(pct)}%</span><progress value={pct} max="100" aria-label="Avance de sesión"/></div></section>
    <section className="modules-section"><div className="section-heading"><div><span className="eyebrow">EXPLORA TU MONITOR</span><h2>Módulos de equilibrio</h2></div><span className="count-pill">{MODULES.length} módulos</span></div><div className="modules-grid">{MODULES.map(module=><ModuleCard key={module.id} module={module} quiet={quiet} sessionActive={engaged} sessionValue={session.status==='idle'?null:pct}/>)}</div></section>
    <div className="closing-note"><span aria-hidden="true">✧</span><p>Menos ruido. Más presencia.<br/><span>Haz de este espacio una pausa en tu día.</span></p><a href="/ciclos.html">Descubre tus próximos ciclos ↗</a></div>
    <audio ref={audioRef} src={musicUrl} preload="none" loop/>
  </main></Shell>;
}
if (typeof document !== 'undefined') createRoot(document.getElementById('root')).render(<App/>);
