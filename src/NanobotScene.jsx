import React, { useId } from 'react';
import { BODY_PATHS, ENTRY_PATH, PHASES, SWARM_SIZE, TARGETS, botPosition, missionState } from './nanobots';
import './nanobots.css';

const asPath = points => points.map((point,i)=>`${i?'L':'M'}${point.join(' ')}`).join(' ');
const SILHOUETTE = 'M223 94 L222 108 Q201 109 188 119 Q174 128 173 146 L159 193 L129 259 Q122 276 131 281 Q139 286 145 272 L178 218 L197 173 L193 237 Q190 261 205 289 L207 359 L203 447 Q197 463 202 468 L225 468 Q231 465 228 453 L234 366 L240 306 L246 366 L252 453 Q249 465 255 468 L278 468 Q283 463 277 447 L273 359 L275 289 Q290 261 287 237 L283 173 L302 218 L335 272 Q341 286 349 281 Q358 276 351 259 L321 193 L307 146 Q306 128 292 119 Q279 109 258 108 L257 94';

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
  const stateText=idle?'Enjambre preparado':paused?'Enjambre en pausa':finished?'Recorrido completado':cancelled?'Recorrido finalizado':'Enjambre en movimiento';
  return <section className={`nano-chamber panel ${quiet?'nano-quiet':''}`} aria-labelledby="nano-title">
    <header className="nano-header"><div><span className="eyebrow">TU MISIÓN INTERIOR</span><h2 id="nano-title">Nanorobots. <em>Una intención, miles de luces.</em></h2></div><span className="nano-link"><i className={`status-dot ${running?'lit':''}`}/>{stateText}</span></header>
    <div className="nano-layout">
      <div className="nano-command"><div className="nano-command-label">01 / ELIGE TU FOCO</div><h3>Dirige el enjambre</h3><p>Elige una zona del mapa y sigue el recorrido con tu atención.</p><div className="target-options" role="group" aria-label="Zona del recorrido">{TARGETS.map(t=><button key={t.id} className={target===t.id?'target-selected':''} aria-pressed={target===t.id} onClick={()=>onTarget(t.id)}><span aria-hidden="true">{target===t.id?'◉':'○'}</span>{t.label}</button>)}</div>
        <div className="swarm-counter"><span>UNIDADES DEL ENJAMBRE</span><strong>{mission.deployed.toLocaleString('es-UY')}<small> / {SWARM_SIZE.toLocaleString('es-UY')}</small></strong><div className="swarm-track"><span style={{width:`${mission.deployed/SWARM_SIZE*100}%`}}/></div></div>
        <button className="button primary nano-launch" onClick={running?onPause:onStart}><span aria-hidden="true">{running?'Ⅱ':'✧'}</span>{running?'Pausar recorrido':paused?'Continuar recorrido':finished||cancelled?'Volver a desplegar':'Desplegar nanorobots'}</button>
        {running||paused?<button className="nano-finish" onClick={onFinish}>Finalizar recorrido</button>:null}
      </div>
      <div className="nano-map"><svg viewBox="0 0 480 500" role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>Mapa corporal del recorrido de nanorobots</title><desc id={`${id}-description`}>{stateText}. Zona elegida: {selected.label}. Etapa: {mission.phase.title}.</desc>
        <defs><linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#135062" stopOpacity=".4"/><stop offset=".5" stopColor="#092936" stopOpacity=".6"/><stop offset="1" stopColor="#146779" stopOpacity=".3"/></linearGradient><radialGradient id={`${id}-aura`}><stop stopColor="#218999" stopOpacity=".16"/><stop offset="1" stopColor="#031620" stopOpacity="0"/></radialGradient><filter id={`${id}-glow`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.5"/></filter></defs>
        <ellipse cx="240" cy="245" rx="192" ry="236" fill={`url(#${id}-aura)`}/>
        <g stroke="#163747" fill="none"><ellipse cx="240" cy="253" rx="184" ry="206" strokeDasharray="2 8"/><path d="M240 12 V483 M26 251 H454" strokeDasharray="2 9"/><path d="M28 64 V34 H57 M423 34 H452 V64 M28 436 V466 H57 M423 466 H452 V436"/></g>
        <g fill={`url(#${id}-body)`} stroke="#39879b" strokeWidth="1.1"><ellipse cx="240" cy="63" rx="30" ry="36"/><path d={SILHOUETTE}/></g>
        <g fill="none" stroke="#2c6678" strokeWidth="1" opacity=".65"><path d="M240 107 V287 M216 123 Q200 164 211 198 Q225 209 234 190 V133 M264 123 Q280 164 269 198 Q255 209 246 190 V133 M211 227 Q240 217 269 227 M213 238 Q240 250 267 238 M218 260 Q240 251 262 260"/></g>
        {BODY_PATHS.map((path,i)=><path key={i} d={asPath(path)} stroke="#409eb0" strokeWidth="1.1" fill="none" opacity={idle?.18:.48}/>)}
        <path d={asPath(ENTRY_PATH)} fill="none" stroke="#70e5e1" strokeWidth="1" strokeDasharray="3 5" opacity={mission.index===0&&!idle?.6:.16}/>
        <circle cx="32" cy="224" r="13" fill="#0a303d" stroke="#3d94a4"/><path d="M26 224 H38 M32 218 V230" stroke="#9beee8"/>
        <text x="30" y="202" fill="#6fadb9" fontSize="8" letterSpacing="1.5">ENTRADA</text>
        {TARGETS.filter(t=>t.id!=='whole').map(t=><circle key={t.id} cx={t.point[0]} cy={t.point[1]} r={t.id===target?24:3} fill={t.id===target?'#56d6d91a':'#4d92a1'} stroke={t.id===target?'#6ee1d6':'none'} strokeDasharray="3 5"/>)}
        {!idle ? Array.from({length:count},(_,i)=>{const [x,y]=botPosition(i,displayTime,target);return <g key={i} className="nano-particle" transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`}><circle r="5" fill="#54f9e9" opacity=".25" filter={quiet?undefined:`url(#${id}-glow)`}/><path d="M-2.8 0 H2.8 M0 -2.8 V2.8" stroke="#adfff5" strokeWidth="1.2"/><circle r="1.2" fill="#f3ffff"/></g>;}):null}
        <ellipse cx="240" cy="481" rx="60" ry="5" fill="#4abfd4" opacity=".12"/>
      </svg><div className="nano-map-caption"><span className="eyebrow">MAPA DE TU RECORRIDO</span><strong>{selected.label}</strong></div></div>
      <aside className="nano-detail"><div className="nano-command-label">02 / ACOMPAÑA EL PROCESO</div><div className="nano-phase-title" aria-live="polite"><span>{idle?'Preparación':finished?'Integración completa':mission.phase.title}</span></div><p>{idle?'Cuando estés listo, observa cómo las luces entran y encuentran su camino.':mission.phase.text}</p><CellularView renewal={visualRenewal} elapsed={displayTime} quiet={quiet}/><div className="cellular-caption"><span>VISTA CELULAR</span><strong>{mission.renewal}% <small>del recorrido</small></strong></div><div className="nano-intention"><span aria-hidden="true">✧</span><p>{finished?'Me quedo con este momento de calma.':'Respiro a mi ritmo. Llevo mi atención a este lugar.'}</p></div></aside>
    </div>
    <ol className="nano-phases" aria-label="Etapas del recorrido">{PHASES.map((phase,i)=><li key={phase.id} className={!idle&&i<=mission.index?'phase-reached':''} aria-current={!idle&&i===mission.index?'step':undefined}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{phase.title}</strong><small>{phase.from}–{phase.to} s</small></div>{!idle&&i<mission.index?<b aria-label="Completada">✓</b>:null}</li>)}</ol>
  </section>;
}
