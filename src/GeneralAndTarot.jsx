import React, { useState } from 'react';
import AIReading from './AIReading';
import { drawCard } from './tarot';
import './general-tarot.css';
export function GeneralReading({reading,context}) {
  return <section className="general-reading" aria-labelledby="general-title"><span className="eyebrow">TODAS LAS MIRADAS, UNA PAUSA</span><h2 id="general-title">Tu resumen general</h2><AIReading key={JSON.stringify([context,reading.sources])} payload={{kind:"summary",context,sources:reading.sources}}><h3>{reading.title}</h3>{reading.paragraphs.map((p,i)=><p key={i}>{p}</p>)}<div className="general-action"><strong>Qué puedes hacer hoy</strong><p>{reading.action}</p><em>{reading.question}</em></div></AIReading><details><summary>Cómo se unen las lecturas</summary><p>Esta síntesis combina los textos y cálculos de la web. La lectura base usa reglas; el botón DeepSeek crea una nueva redacción con IA; las coincidencias entre métodos no son una confirmación de lo que ocurrirá.</p>{reading.sources.map(([name,text])=><p key={name}><strong>{name}:</strong> {text}</p>)}</details></section>;
}
export function TarotCard({context,sources}) {
  const [draw,setDraw]=useState(null);
  const [error,setError]=useState('');
  function choose() {
    try { setDraw({card:drawCard(),context,sources,id:Date.now()});setError(''); }
    catch { setError('No se pudo realizar el sorteo. Vuelve a intentarlo en un navegador actualizado.'); }
  }
  return <section className="tarot-section" aria-labelledby="tarot-title"><div className="tarot-intro"><span className="eyebrow">UN SÍMBOLO PARA EXPLORAR</span><h2 id="tarot-title">Tu carta al azar</h2><p>Piensa en una pregunta o simplemente deja espacio a lo que te sugiera la carta.</p><button type="button" onClick={choose}>{draw?'Sacar otra carta':'Sacar una carta'}</button><p className="tarot-caption">22 arcanos mayores · cartas al derecho · cada sorteo es independiente y puede repetir carta.</p>{error && <p role="alert">{error}</p>}</div><div className="tarot-result" aria-live="polite" aria-atomic="true">{draw ? <><div className="tarot-face" aria-label={draw.card.name}><span>{draw.card.id}</span><b aria-hidden="true">{draw.card.symbol}</b><strong>{draw.card.name}</strong></div><div className="tarot-message"><span className="eyebrow">{draw.card.theme}</span><h3>{draw.card.name}</h3><AIReading key={draw.id} payload={{kind:"tarot",context:draw.context,sources:draw.sources,cardId:draw.card.id}}><p>{draw.card.text}</p><strong>Qué puedes hacer hoy</strong><p>{draw.card.action}</p><em>{draw.card.question}</em></AIReading><p className="tarot-caption">Momento consultado: {draw.context}. La carta permanece hasta tu próximo sorteo o hasta salir de la página.</p></div></> : <div className="tarot-face tarot-back" aria-hidden="true"><span>✧</span><b>☾</b><strong>Una nueva mirada</strong></div>}</div></section>;
}
