import React, { useEffect, useState } from 'react';
import { drawCard } from './tarot';
import './general-tarot.css';

export function GeneralReading({ reading }) {
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const sourceKey = JSON.stringify(reading.sources);

  useEffect(() => {
    setGenerated(null);
    setError('');
  }, [sourceKey]);

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/deepseek-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: reading.sources.map(([name, text]) => ({ name, text })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo generar la síntesis.');
      setGenerated(data.reading);
    } catch (err) {
      setError(err.message || 'No se pudo generar la síntesis. Vuelve a intentarlo.');
    } finally {
      setLoading(false);
    }
  }

  return <section className="general-reading" aria-labelledby="general-title">
    <span className="eyebrow">TODAS LAS MIRADAS, UNA PAUSA</span>
    <h2 id="general-title">Tu resumen general</h2>
    <p>DeepSeek integra las lecturas del momento en una reflexión, una acción y una pregunta.</p>
    <p className="reading-caption">Al pedir la síntesis se envían a DeepSeek los textos de las lecturas. No se envían tu nombre ni tu fecha u hora de nacimiento. Es una reflexión simbólica, no una predicción ni un consejo médico.</p>
    <button type="button" onClick={generate} disabled={loading} aria-busy={loading}>
      {loading ? 'Preparando tu síntesis…' : generated ? 'Generar otra síntesis' : 'Generar síntesis con DeepSeek'}
    </button>
    {loading && <p role="status">DeepSeek está reuniendo las lecturas…</p>}
    {error && <p className="reading-error" role="alert">{error}</p>}
    {generated && <div className="deepseek-reading" aria-live="polite">
      <p className="reading-caption">Síntesis generada con DeepSeek</p>
      <h3>{generated.title}</h3>
      {generated.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      <div className="general-action">
        <strong>Qué puedes hacer hoy</strong>
        <p>{generated.action}</p>
        <em>{generated.question}</em>
      </div>
    </div>}
    <details>
      <summary>Lecturas que se incluyen</summary>
      {reading.sources.map(([name, text]) => <p key={name}><strong>{name}:</strong> {text}</p>)}
    </details>
  </section>;
}

export function TarotCard({context}) {
  const [draw,setDraw]=useState(null);
  const [error,setError]=useState('');
  function choose() {
    try { setDraw({card:drawCard(),context});setError(''); }
    catch { setError('No se pudo realizar el sorteo. Vuelve a intentarlo en un navegador actualizado.'); }
  }
  return <section className="tarot-section" aria-labelledby="tarot-title"><div className="tarot-intro"><span className="eyebrow">UN SÍMBOLO PARA EXPLORAR</span><h2 id="tarot-title">Tu carta al azar</h2><p>Piensa en una pregunta o simplemente deja espacio a lo que te sugiera la carta.</p><button type="button" onClick={choose}>{draw?'Sacar otra carta':'Sacar una carta'}</button><p className="tarot-caption">22 arcanos mayores · cartas al derecho · cada sorteo es independiente y puede repetir carta.</p>{error && <p role="alert">{error}</p>}</div><div className="tarot-result" aria-live="polite" aria-atomic="true">{draw ? <><div className="tarot-face" aria-label={draw.card.name}><span>{draw.card.id}</span><b aria-hidden="true">{draw.card.symbol}</b><strong>{draw.card.name}</strong></div><div className="tarot-message"><span className="eyebrow">{draw.card.theme}</span><h3>{draw.card.name}</h3><p>{draw.card.text}</p><strong>Qué puedes hacer hoy</strong><p>{draw.card.action}</p><em>{draw.card.question}</em><p className="tarot-caption">Momento consultado: {draw.context}. La carta permanece hasta tu próximo sorteo o hasta salir de la página.</p></div></> : <div className="tarot-face tarot-back" aria-hidden="true"><span>✧</span><b>☾</b><strong>Una nueva mirada</strong></div>}</div></section>;
}
