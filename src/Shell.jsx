import React from 'react';

export function Brand() { return <a className="brand" href="/"><span className="brand-symbol" aria-hidden="true">✳</span><span>biohealing<span className="brand-sub">PERSONAL MONITOR</span></span></a>; }
export function Shell({children, page = 'monitor'}) {
  return <div className="app-shell">
    <a className="skip-link" href="#main">Saltar al contenido</a>
    <aside className="sidebar"><Brand/><div className="nav-caption">TU ESPACIO</div><nav aria-label="Navegación principal">
      <a className={page==='monitor'?'nav-active':''} aria-current={page==='monitor'?'page':undefined} href="/"><span aria-hidden="true">◉</span> Monitor</a>
      <a className={page==='cycles'?'nav-active':''} aria-current={page==='cycles'?'page':undefined} href="/ciclos.html"><span aria-hidden="true">◷</span> Mis ciclos</a>
      <a href="/ciclos.html#perfil"><span aria-hidden="true">◇</span> Mi perfil</a>
    </nav><div className="sidebar-bottom"><div className="orbit-mark" aria-hidden="true"><span>✧</span></div><p>Un momento<br/><strong>para conectar contigo.</strong></p><span className="version">BIOHEALING · 02</span></div></aside>
    <div className="workspace">{children}<footer className="app-footer"><span><i className="status-dot"/> Experiencia personal · Datos en este navegador</span><span>Simulación visual y lecturas simbólicas. No son mediciones médicas.</span></footer></div>
  </div>;
}
