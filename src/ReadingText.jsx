import React from 'react';
import './personal-methods.css';
const LABELS=['Para integrar hoy','Tu frase del día','Tu práctica de un minuto'];
export default function ReadingText({text}){
 const paragraphs=text.split(/\n\s*\n/);
 return <div className="ai-prose">{paragraphs.map((p,i)=>{const label=LABELS.find(l=>p.startsWith(l+':'));return label?<section className="integration-step" key={i}><h3>{label}</h3><p>{p.slice(label.length+1).trim()}</p></section>:<p key={i}>{p}</p>;})}</div>;
}
