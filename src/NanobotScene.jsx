import React, { useId, useState } from 'react';
import { AnatomicalBody, VascularLayer } from './AnatomicalBody';
import { ENTRY_PATH, PHASES, SWARM_SIZE, TARGETS, botPosition, missionState } from './nanobots';
import './nanobots.css';

const asPath = points => points.map((point,i)=>`${i?'L':'M'}${point.join(' ')}`).join(' ');


function CellularView({renewal, elapsed, quiet}) {
  const cells = [[55,65],[112,46],[165,78],[86,118],[145,137],[44,163],[194,151]];
  return <svg className="cellular-view" viewBox="0 0 240 208" role="img" aria-label={`Animación celular: ${renewal}% del recorrido de renovación`}>
    <circle cx="120" cy="104" r="95" fill="#061e2a" stroke="#164354"/>
    {cells.map(([x,y],i)=>{
      const fraction=Math.max(0,Math.min(1,renewal/100*1.6-i*.08));
      const radius=19+(i%3)*3;
      const angle=(quiet?0:elapsed*.6)+i;
      return <g key={i}>
        <circle cx={x} cy={y} r={radius} fill="#0c3543" stroke="#245466" strokeWidth="1.5" strokeDasharray="5 4"/>
        <circle cx={x} cy={y} r={radius} fill="none" stroke="#79eade" strokeWidth="2" pathLength="100" strokeDasharray={`${fraction*100} 100`} transform={`rotate(-90 ${x} ${y})`}/>
        <circle cx={x} cy={y} r="6" fill={fraction>=1?'#80e7d9':'#337382'}/>
        <circle cx={x+Math.cos(angle)*(radius+4)} cy={y+Math.sin(angle)*(radius+4)} r="2.7" fill="#ccfff6" opacity={renewal>0?1:.25}/>
      </g>;
    })}
  </svg>;
}

export default function NanobotScene({session,quiet,target,onTarget,onStart,onPause,onFinish}) {
  const id=useId().replace(/:/g,'');
  const [bodyOpacity,setBodyOpacity]=useState(.68);
  const [showVeins,setShowVeins]=useState(true);
  const mission=missionState(session.elapsed,session.status);
  const selected=TARGETS.find(t=>t.id===target)||TARGETS[0];
  const idle=session.status==='idle';
  const running=session.status==='running';
  const paused=session.status==='paused';
  const finished=session.status==='complete';
  const cancelled=session.status==='cancelled';
  const count=quiet?14:56;
  // Reduced motion updates the map by phase, while the session counters remain live.
  const mapTime=quiet?[0,16,34,60][mission.index]:session.elapsed;
  const displayTime=finished?60:mapTime;
  const visualRenewal=quiet?(mission.index>2?100:mission.index===2?50:0):mission.renewal;
  const stateText=idle?'Enjambre preparado':paused?'Enjambre en pausa':finished?'En vigilancia':cancelled?'Recorrido finalizado':'Enjambre en movimiento';
  return <section className={`nano-chamber panel ${quiet?'nano-quiet':''} ${finished?'nano-patrol':''}`} aria-labelledby="nano-title">
    <header className="nano-header"><div><span className="eyebrow">TU MISIÓN INTERIOR</span><h2 id="nano-title">Nanorobots. <em>Una intención, miles de luces.</em></h2></div><span className="nano-link"><i className={`status-dot ${running?'lit':''}`}/>{stateText}</span></header>
    <div className="nano-layout">
      <div className="nano-command"><div className="nano-command-label">01 / ELIGE TU FOCO</div><h3>Dirige el enjambre</h3><p>Elige una zona del mapa y sigue el recorrido con tu atención.</p><div className="target-options" role="group" aria-label="Zona del recorrido">{TARGETS.map(t=><button key={t.id} className={target===t.id?'target-selected':''} aria-pressed={target===t.id} onClick={()=>onTarget(t.id)}><span aria-hidden="true">{target===t.id?'◉':'○'}</span>{t.label}</button>)}</div>
        <div className="anatomy-controls"><label htmlFor={`${id}-opacity`}><span>Transparencia del cuerpo</span><output>{Math.round((1-bodyOpacity)*100)}%</output></label><input id={`${id}-opacity`} type="range" min="10" max="85" value={Math.round((1-bodyOpacity)*100)} onChange={e=>setBodyOpacity(1-Number(e.target.value)/100)}/><button className={showVeins?'vein-toggle selected':'vein-toggle'} aria-pressed={showVeins} onClick={()=>setShowVeins(v=>!v)}>◈ {showVeins?'Red vascular visible':'Mostrar red vascular'}</button></div>
        <div className="swarm-counter"><span>UNIDADES DEL ENJAMBRE</span><strong>{mission.deployed.toLocaleString('es-UY')}<small> / {SWARM_SIZE.toLocaleString('es-UY')}</small></strong><div className="swarm-track"><span style={{width:`${mission.deployed/SWARM_SIZE*100}%`}}/></div></div>
        <button className="button primary nano-launch" onClick={running?onPause:onStart}><span aria-hidden="true">{running?'Ⅱ':'✧'}</span>{running?'Pausar recorrido':paused?'Continuar recorrido':finished||cancelled?'Volver a desplegar':'Desplegar nanorobots'}</button>
        {running||paused?<button className="nano-finish" onClick={onFinish}>Finalizar recorrido</button>:null}
      </div>
      <div className="nano-map"><svg viewBox="0 0 480 500" role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>Mapa corporal del recorrido de nanorobots</title><desc id={`${id}-description`}>{stateText}. Zona elegida: {selected.label}. Etapa: {mission.phase.title}.</desc>
        <defs><linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#135062" stopOpacity=".4"/><stop offset=".5" stopColor="#092936" stopOpacity=".6"/><stop offset="1" stopColor="#146779" stopOpacity=".3"/></linearGradient><radialGradient id={`${id}-aura`}><stop stopColor="#218999" stopOpacity=".16"/><stop offset="1" stopColor="#031620" stopOpacity="0"/></radialGradient><filter id={`${id}-glow`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.5"/></filter></defs>
        <ellipse cx="240" cy="245" rx="192" ry="236" fill={`url(#${id}-aura)`}/>
        <g stroke="#163747" fill="none"><ellipse cx="240" cy="253" rx="184" ry="206" strokeDasharray="2 8"/><path d="M240 12 V483 M26 251 H454" strokeDasharray="2 9"/><path d="M28 64 V34 H57 M423 34 H452 V64 M28 436 V466 H57 M423 466 H452 V436"/></g>
        <AnatomicalBody id={id} opacity={bodyOpacity}/>
        <VascularLayer id={id} opacity={showVeins ? mission.veinOpacity : 0}/>
        <path d={asPath(ENTRY_PATH)} fill="none" stroke="#70e5e1" strokeWidth="1" strokeDasharray="3 5" opacity={mission.index===0&&!idle ? .75 : 0}/>
        <g className="entry-port" opacity={finished?.3:1}><path d="M56 209 H111 L164 225" fill="none" stroke="#65bda9" strokeWidth=".7"/><circle cx="164" cy="225" r="7" fill="#164a42" stroke="#abf3ca"/><circle cx="164" cy="225" r="2" fill="#d5ffe5"/><text x="56" y="201" fill="#9ad2bd" fontSize="7" letterSpacing="1.2">PUNTO DE ENTRADA</text></g>
        {TARGETS.filter(t=>t.id!=='whole').map(t=><circle key={t.id} cx={t.point[0]} cy={t.point[1]} r={t.id===target?24:3} fill={t.id===target?'#56d6d91a':'#4d92a1'} stroke={t.id===target?'#6ee1d6':'none'} strokeDasharray="3 5"/>)}
        {!idle ? Array.from({length:count},(_,i)=>{const [x,y]=botPosition(quiet?i*4+i%2:i,displayTime,target);return <g key={i} className="nano-particle" transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`}><circle r="5" fill="#54f9e9" opacity=".25" filter={quiet?undefined:`url(#${id}-glow)`}/><path d="M-2.8 0 H2.8 M0 -2.8 V2.8" stroke="#adfff5" strokeWidth="1.2"/><circle r="1.2" fill="#f3ffff"/>{finished&&!quiet?<circle className="patrol-halo" r="4" fill="none" stroke="#91e9ba" strokeWidth=".6" style={{animationDelay:`${-i*.17}s`}}/>:null}</g>;}):null}
        <ellipse cx="240" cy="481" rx="60" ry="5" fill="#4abfd4" opacity=".12"/>
      </svg><div className="nano-map-caption"><span className="eyebrow">MAPA DE TU RECORRIDO</span><strong>{selected.label}</strong></div></div>
      <aside className="nano-detail"><div className="nano-command-label">02 / ACOMPAÑA EL PROCESO</div><div className="nano-phase-title" aria-live="polite"><span>{idle?'Preparación':finished?'Vigilancia distribuida':mission.phase.title}</span></div><p>{idle?'Observa el punto del antebrazo: desde allí saldrán todas las unidades hacia la red de caminos.':mission.phase.text}</p><CellularView renewal={visualRenewal} elapsed={displayTime} quiet={quiet}/><div className="cellular-caption"><span>VISTA CELULAR</span><strong>{mission.renewal}% <small>del recorrido</small></strong></div><div className="nano-intention"><span aria-hidden="true">✧</span><p>{finished?'Las luces permanecen. Me quedo con este momento de calma.':'Respiro a mi ritmo. Llevo mi atención a este lugar.'}</p></div></aside>
    </div>
    <ol className="nano-phases" aria-label="Etapas del recorrido">{PHASES.map((phase,i)=><li key={phase.id} className={!idle&&i<=mission.index?'phase-reached':''} aria-current={!idle&&i===mission.index?'step':undefined}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{phase.title}</strong><small>{phase.from}–{phase.to} s</small></div>{!idle&&i<mission.index?<b aria-label="Completada">✓</b>:null}</li>)}</ol>
  </section>;
}
