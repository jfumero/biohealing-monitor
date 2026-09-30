import React, { useId, useRef, useState, useEffect } from 'react';
import './nanobots.css';
import Icon from './Icon';
import './harmonious.css';

export function Brand() { return <a className="brand" href="/"><span className="brand-symbol" aria-hidden="true">✳</span><span>biohealing<span className="brand-sub">TU ESPACIO PERSONAL</span></span></a>; }
export function Shell({children, page = 'visualization'}) {
  const [menu,setMenu]=useState(false);
  const [hash,setHash]=useState(()=>typeof location!=='undefined'?location.hash:'');
  useEffect(()=>{const update=()=>setHash(location.hash);window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update);},[]);
  const links=[['day','Mi día','/','home'],['cycles','Mis ciclos','/ciclos.html','cycles'],['card','Mi carta','/#carta','card'],['visualization','Visualización','/visualizacion.html','eye'],['chat','Conversar','/#conversar','chat']];
  const selected=page==='day'?(hash==='#carta'?'card':hash==='#conversar'?'chat':'day'):page;
  const about = useRef(null);
  const aboutTitle = useId();
  return <div className="app-shell harmonious">
    <a className="skip-link" href="#main">Saltar al contenido</a>
    <header className="mobile-bar"><Brand/><button onClick={()=>setMenu(v=>!v)} aria-expanded={menu} aria-controls="main-navigation" aria-label={menu?'Cerrar menú':'Abrir menú'}><Icon name={menu?'close':'menu'}/></button></header>
    <aside className={`sidebar ${menu?'menu-open':''}`} id="main-navigation"><Brand/><div className="nav-caption">TU ESPACIO</div><nav aria-label="Navegación principal">
      {links.map(([id,label,href,icon])=><a key={id} className={selected===id?'nav-active':''} aria-current={selected===id?'page':undefined} href={href} onClick={()=>{setMenu(false);if(typeof location!=='undefined' && href===location.pathname+location.hash)window.dispatchEvent(new Event('hashchange'));}}><Icon name={icon}/>{label}</a>)}
    </nav><div className="sidebar-bottom"><a href="/ciclos.html#perfil" onClick={()=>setMenu(false)}><Icon name="user"/>Mi perfil</a><a href="/visualizacion.html#ajustes" onClick={()=>setMenu(false)}><Icon name="settings"/>Ajustes</a></div></aside>
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
