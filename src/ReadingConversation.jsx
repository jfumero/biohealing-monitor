import React, { useEffect, useId, useRef, useState } from 'react';
import './reading-conversation.css';
const errors={balance:'DeepSeek indica que falta saldo en la API.',rate_limit:'Espera un minuto antes de volver a preguntar.',not_configured:'La conexión con DeepSeek no está configurada.',credentials:'La clave de DeepSeek no fue aceptada.',timeout:'La respuesta tardó demasiado. Puedes reintentar la misma pregunta.'};
export default function ReadingConversation({payload,reading='',initialMessages=[],initialQuestion='',onPersist,inline=false}) {
  const [messages,setMessages]=useState(initialMessages),[question,setQuestion]=useState(initialQuestion),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const active=useRef(null),mounted=useRef(true),inputId=useId();
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;active.current?.abort();};},[]);
  const persist=useRef(onPersist);persist.current=onPersist;
  useEffect(()=>{persist.current?.(messages,question);},[messages,question]);
  async function send(event) {
    event.preventDefault();
    const asked=question.trim();if(!asked || active.current) return;
    const controller=new AbortController();active.current=controller;setBusy(true);setError('');
    const timeout=setTimeout(()=>controller.abort(),50000);
    try {
      const response=await fetch('/api/reading',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({...payload,kind:'chat',reading,question:asked,history:messages.slice(-4)})});
      const data=await response.json();
      if(!response.ok || typeof data.text!=='string') throw Error(errors[data.error] || 'No se pudo obtener la respuesta. Tu pregunta sigue aquí para reintentarlo.');
      if(mounted.current && !controller.signal.aborted){setMessages(previous=>[...previous.slice(-98),{role:'user',content:asked},{role:'assistant',content:data.text}]);setQuestion('');}
    } catch(e){if(mounted.current)setError(controller.signal.aborted?'La consulta se interrumpió. Puedes volver a enviarla.':e instanceof TypeError?'No se pudo conectar. Tu pregunta se conserva.':e.message);}
    finally {clearTimeout(timeout);active.current=null;if(mounted.current)setBusy(false);}
  }
  const suggestions=payload.kind==='tarot'?['¿Cómo se relaciona esta carta con mi lectura?','¿Qué significa esta carta en palabras sencillas?']:['¿Cuál es la idea más importante de mi lectura?','¿Hay resultados que se contradigan?','¿Cómo podría aplicar esto a una decisión cotidiana?'];
  const Container=inline?'section':'details',Title=inline?'h3':'summary';
  return <Container className={`reading-conversation ${inline?'conversation-inline':''}`}><Title>{inline?'¿Qué te gustaría conversar?':payload.kind==='tarot'?'Conversar sobre esta carta':'Conversar sobre mi lectura'}</Title><p className="conversation-note">Puedes preguntar por los significados, las conexiones o algo que no te haya quedado claro. Se envían tu pregunta, esta lectura y las dos últimas preguntas y respuestas a DeepSeek. No incluyas datos que prefieras mantener privados.</p><div className="question-suggestions">{suggestions.map(text=><button key={text} type="button" disabled={busy} onClick={()=>setQuestion(text)}>{text}</button>)}</div><div className="conversation-messages" role="log" aria-label="Conversación sobre la lectura" aria-live="polite" aria-relevant="additions">{messages.map((message,index)=><div className={`conversation-message ${message.role}`} key={index}><strong>{message.role==='user'?'Tú':'DeepSeek'}</strong><p>{message.content}</p></div>)}</div><form onSubmit={send}><label htmlFor={inputId}>Tu pregunta</label><textarea id={inputId} value={question} onChange={e=>setQuestion(e.target.value)} maxLength={1000} rows={3} disabled={busy} placeholder="¿Qué parte de la lectura te gustaría entender mejor?" required/><div className="conversation-actions"><button type="submit" className="ai-button" disabled={busy || !question.trim()}>{busy?'Pensando la respuesta…':'Enviar pregunta'}</button>{messages.length>0 && <button type="button" disabled={busy} onClick={()=>{setMessages([]);setError('');}}>Nueva conversación</button>}<span>{question.length}/1000</span></div></form><p role="status">{busy?'Estoy leyendo tu pregunta…':error}</p><p className="conversation-note">{inline?'La conversación se guarda en este navegador (hasta 50 intercambios). Cada pregunta incluye esta lectura y los dos últimos intercambios y usa tu saldo de API.':'La conversación se conserva durante esta visita. Cada envío usa tu saldo de API.'}</p></Container>;
}
