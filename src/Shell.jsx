import React, { useId, useRef } from 'react';
import './nanobots.css';

export function Brand() { return <a className="brand" href="/"><span className="brand-symbol" aria-hidden="true">✳</span><span>biohealing<span className="brand-sub">PERSONAL MONITOR</span></span></a>; }
export function Shell({children, page = 'monitor'}) {
  const about = useRef(null);
  const aboutTitle = useId();
  return <div className="app-shell">
    <a className="skip-link" href="#main">Saltar al contenido</a>
    <aside className="sidebar"><Brand/><div className="nav-caption">TU ESPACIO</div><nav aria-label="Navegación principal">
      <a className={page==='monitor'?'nav-active':''} aria-current={page==='monitor'?'page':undefined} href="/"><span aria-hidden="true">◉</span> Monitor</a>
      <a className={page==='cycles'?'nav-active':''} aria-current={page==='cycles'?'page':undefined} href="/ciclos.html"><span aria-hidden="true">◷</span> Mis ciclos</a>
      <a href="/ciclos.html#perfil"><span aria-hidden="true">◇</span> Mi perfil</a>
    </nav><div className="sidebar-bottom"><div className="orbit-mark" aria-hidden="true"><span>✧</span></div><p>Un momento<br/><strong>para conectar contigo.</strong></p><span className="version">BIOHEALING · 02</span></div></aside>
    <dialog ref={about} className="about-dialog" aria-labelledby={aboutTitle} onClick={e=>{if(e.target===e.currentTarget)about.current.close();}}>
      <h2 id={aboutTitle}>Tu espacio de visualización</h2>
      <p>BioHealing es un juego personal de imaginación guiada. Los nanorobots, los recorridos y las escenas celulares forman parte de esa experiencia: no representan dispositivos dentro del cuerpo ni una conexión con él.</p>
      <p>Los porcentajes indican el avance de las animaciones, no cambios medidos en tu salud. La visualización no garantiza curación ni sustituye atención médica.</p>
      <p>Las lecturas de ciclos son simbólicas; Jyotish y Human Design utilizan cálculos aproximados. El perfil se guarda en este navegador.</p>
      <button className="button primary" autoFocus onClick={()=>about.current.close()}>Volver a mi espacio</button>
    </dialog>
    <div className="workspace">{children}<footer className="app-footer"><span><i className="status-dot"/> Experiencia personal · Datos en este navegador</span><button className="about-button" onClick={()=>about.current.showModal()}>Acerca de BioHealing</button></footer></div>
  </div>;
}
