import React, { useEffect, useRef, useState } from 'react';
import { lifeSnapshot } from './life-clock';
import './life-clock.css';
const labels = ['años', 'meses', 'días', 'horas', 'minutos', 'segundos'];
export default function LifeClock({ profile, quiet }) {
  const [now, setNow] = useState(() => new Date());
  const [balloons, setBalloons] = useState(false);
  const seen = useRef('');
  const state = lifeSnapshot(profile, now);
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    if (!state.birthday || seen.current === state.birthdayKey) return;
    seen.current = state.birthdayKey;
    try {
      if (sessionStorage.getItem(`birthday:${state.birthdayKey}`)) return;
      sessionStorage.setItem(`birthday:${state.birthdayKey}`, '1');
    } catch { /* Celebration still works when storage is unavailable. */ }
    setBalloons(true);
  }, [state.birthday, state.birthdayKey]);
  useEffect(() => { if (!balloons) return; const timer = setTimeout(() => setBalloons(false), 12000); return () => clearTimeout(timer); }, [balloons]);
  return <section className="life-clock" aria-labelledby="life-title">
    <div className="life-heading"><div><div className="eyebrow">CADA INSTANTE CUENTA</div><h2 id="life-title">Tu reloj de vida</h2></div><a href="/ciclos.html#perfil">Ajustar mis fechas ↗</a></div>
    <div className="life-digits" role="timer" aria-label="Edad desde el nacimiento" aria-live="off">{labels.map((label, i) => <div key={label}><strong>{state.age ? String(state.age[i]).padStart(2, '0') : '—'}</strong><span>{label}</span></div>)}</div>
    <p className="life-origin">Desde el {profile.birthDate.split('-').reverse().join('/')} a las {profile.birthTime} · UTC{profile.birthUtcOffset >= 0 ? '+' : ''}{profile.birthUtcOffset}</p>
    {!state.age && <p>La fecha de nacimiento está en el futuro. Revísala en tu perfil.</p>}
    <div className="life-prenatal"><span className="life-spark">✧</span><div><span>Desde la concepción <small>ESTIMADO</small></span><strong>{state.prenatal ? `≈ ${state.prenatal[0]} años · ${state.prenatal[1]} meses · ${state.prenatal[2]} días` : 'Revisa tus fechas'}</strong></div><span className="life-seed">Un comienzo antes de nacer</span></div>
    {state.birthday && <div className="life-birthday" role="status">¡Feliz cumpleaños, {profile.name.split(' ')[0]}! Una nueva vuelta al sol. <button onClick={() => setBalloons(true)}>Celebrar 🎈</button></div>}
    <details className="life-details"><summary>Sobre este reloj</summary><p>La cuenta avanza cada segundo según la fecha, hora y huso al nacer que indiques. Su precisión depende de esos datos y del reloj de tu dispositivo; los segundos de nacimiento se toman como 00.</p><p>Concepción estimada: {state.conception.split('-').reverse().join('/')}. {profile.conceptionDate ? 'Has indicado esta fecha en tu perfil.' : 'Se calcula restando 266 días (38 semanas) al nacimiento.'} No permite conocer el día real de concepción; por eso mostramos esta edad solo hasta los días. Puedes ajustar la fecha en tu perfil.</p><p>Los cumpleaños del 29 de febrero se celebran el 28 en años no bisiestos. El conteo coreano tradicional es otra convención y no calcula la concepción.</p></details>
    {balloons && <div className={`birthday-sky ${quiet ? 'birthday-still' : ''}`} aria-hidden="true">{Array.from({length:18},(_,i)=><i key={i} style={{'--x':`${(i*37)%100}%`,'--delay':`${i*.17}s`,'--shade':i%3,'--drift':`${(i%2?1:-1)*45}px`}} />)}</div>}
  </section>;
}
