import { TAROT } from './tarot';
import ReadingConversation from './ReadingConversation';
import React, { useEffect, useRef, useState } from 'react';
const ERRORS={not_configured:'La conexión con DeepSeek todavía no está configurada.',balance:'DeepSeek indica que falta saldo en la cuenta de la API.',credentials:'DeepSeek no ha aceptado la clave configurada en el servidor.',rate_limit:'Espera un minuto antes de pedir otra lectura.',provider_busy:'DeepSeek está ocupado. Prueba de nuevo en un momento.',timeout:'La lectura tardó demasiado. Puedes volver a intentarlo.'};
export default function AIReading({payload,children,requireCard=false,onDraw,drawError}) {
  const [text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const controller=useRef(null);
  useEffect(()=>()=>controller.current?.abort(),[]);
  async function generate(){
    if(controller.current) return;
    const request=new AbortController();controller.current=request;
    setBusy(true);setError('');
    const timeout=setTimeout(()=>request.abort(),50000);
    try {
      const response=await fetch('/api/reading',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:request.signal});
      const result=await response.json();
      if(!response.ok || typeof result.text!=='string') throw Error(ERRORS[result.error] || 'No se pudo obtener la lectura. Puedes intentarlo de nuevo.');
      if(!request.signal.aborted)setText(result.text);
    } catch(e){if(!request.signal.aborted)setError(e.message==='Failed to fetch'?'No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo.':e.message);else setError('La lectura se interrumpió. Puedes volver a intentarlo.');}
    finally {clearTimeout(timeout);controller.current=null;setBusy(false);}
  }
  if(requireCard && payload.cardId==null)return <div className="ai-reading"><div className="daily-card-prompt"><span className="eyebrow">ANTES DE CONVERSAR</span><h3>Sacá tu carta del día</h3><p>La vamos a unir a los datos de tus nueve métodos para que la IA pueda relacionarlos y responder tus preguntas.</p><button className="ai-button" onClick={onDraw}>Sacar mi carta y continuar</button>{drawError && <p role="alert">{drawError}</p>}</div><div className="daily-base-reading">{children}</div></div>;
  return <div className="ai-reading">{payload.cardId!=null && <p className="daily-card-context">Tu carta: <strong>{TAROT[payload.cardId]?.name}</strong> · Incluida junto a tus métodos del día.</p>}<button className="ai-button" type="button" disabled={busy} onClick={generate}>{busy?'Preparando tu lectura…':text?'Crear otra lectura con IA':'Leer con DeepSeek'}</button><p className="ai-note">Al pulsar se envían a DeepSeek los resultados de los métodos y, si corresponde, la carta. Sin nombre ni fecha de nacimiento.</p><div role="status">{busy?'Un momento: estoy uniendo las distintas miradas.':error}</div>{text?<><div className="ai-prose"><span className="eyebrow">LECTURA CON DEEPSEEK</span>{text.split(/\n\s*\n/).map((p,i)=><p key={i}>{p}</p>)}</div><details><summary>Ver la lectura base</summary>{children}</details></>:children}<ReadingConversation key={text} payload={payload} reading={text}/></div>;
}
