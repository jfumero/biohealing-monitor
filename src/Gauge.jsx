import React, { useId } from 'react';

const point = (angle, radius) => { const a = angle * Math.PI / 180; return [160 + Math.sin(a) * radius, 160 - Math.cos(a) * radius]; };
const arc = (radius, from, to) => { const a = point(from, radius), b = point(to, radius); return `M ${a.join(' ')} A ${radius} ${radius} 0 ${to-from > 180 ? 1 : 0} 1 ${b.join(' ')}`; };

export default function Gauge({ value = 0, label = 'Progreso', large = false, active = false }) {
  const id = useId().replace(/:/g, '');
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  return <div className={`instrument ${large ? 'instrument-large' : ''} ${active ? 'instrument-active' : ''}`} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(safeValue)}>
    <svg viewBox="0 0 320 320" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#0b4d64"/><stop offset=".36" stopColor="#76f5f2"/><stop offset=".65" stopColor="#2392a7"/><stop offset="1" stopColor="#093546"/></linearGradient>
        <radialGradient id={`${id}-face`}><stop stopColor="#103a48"/><stop offset=".7" stopColor="#062531"/><stop offset="1" stopColor="#021822"/></radialGradient>
        <filter id={`${id}-glow`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <circle cx="160" cy="160" r="144" fill="none" stroke="#0d3545" strokeWidth="9" strokeDasharray="2 7"/>
      <circle cx="160" cy="160" r="131" fill={`url(#${id}-face)`} stroke="#0a4758" strokeWidth="2"/>
      <path d={arc(124,-135,135)} fill="none" stroke="#27dfdf" strokeWidth="16" opacity=".14" filter={`url(#${id}-glow)`}/>
      <path d={arc(124,-135,135)} fill="none" stroke={`url(#${id}-ring)`} strokeWidth="13"/>
      <path d={arc(133,-135,135)} fill="none" stroke="#79eef0" strokeWidth=".8" opacity=".55"/>
      <path d={arc(112,-135,135)} fill="none" stroke="#1b6a7b" strokeWidth="1"/>
      {Array.from({length:51},(_,i)=>{const a=-135+i*5.4; const p=point(a,108), q=point(a,i%5===0?95:102); return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={i%5===0?'#7dcdd4':'#21586b'} strokeWidth={i%5===0?2:1}/>;})}
      {Array.from({length:11},(_,i)=>{const p=point(-135+i*27,123);return <text key={i} x={p[0]} y={p[1]+3} textAnchor="middle" fill="#dcffff" fontSize="9" fontFamily="monospace">{i*10}</text>;})}
      <text x="160" y="109" textAnchor="middle" fill="#71a8b4" fontSize="9" letterSpacing="3">BIOHEALING</text>
      <circle cx="160" cy="160" r="29" fill="none" stroke="#125262" strokeWidth="5" strokeDasharray="1 5"/>
      <g className="gauge-needle" style={{transform:`rotate(${-135 + safeValue*2.7}deg)`}}>
        <path d="M155 162 L160 66 L165 162 Z" fill="#4dffff" filter={`url(#${id}-glow)`}/>
        <path d="M157 163 L160 70 L163 163 Z" fill="#e1ffff"/>
      </g>
      <circle cx="160" cy="160" r="7" fill="#b6ffff"/>
      <circle cx="160" cy="160" r="13" fill="#46f1f2" opacity=".35" filter={`url(#${id}-glow)`}/>
      <path d="M80 249 Q160 293 240 249 L229 263 Q160 303 91 263 Z" fill={`url(#${id}-ring)`} opacity=".55"/>
      <circle cx="160" cy="234" r="37" fill="#041d29" stroke="#0c596c" strokeWidth="6"/>
      <circle cx="160" cy="234" r="31" fill="#0e4252" stroke="#52d1d8" strokeWidth="1"/>
      <text x="160" y="236" textAnchor="middle" fill="#e0ffff" fontSize="24" fontFamily="monospace" fontWeight="600">{Math.round(safeValue)}<tspan fontSize="12">%</tspan></text>
      <text x="160" y="251" textAnchor="middle" fill="#85c3cb" fontSize="7" letterSpacing="1.5">PROGRESO</text>
    </svg>
  </div>;
}
