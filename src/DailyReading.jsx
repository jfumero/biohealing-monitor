import ReadingText from './ReadingText';
import React,{useEffect,useRef} from 'react';
import {drawCard,TAROT} from './tarot';
import ReadingConversation from './ReadingConversation';
import './general-tarot.css';
export default function DailyReading({session,save,identity,context,overview,busy,setBusy,error,setError,storageError}){
  const active=useRef(null),heading=useRef(null);
  useEffect(()=>()=>active.current?.abort(),[]);
  async function discover(){
    if(active.current)return;
    let current=session?{...session,context,sources:overview.aiSources || overview.sources}:null;
    try{
      if(!current){current={version:1,identity,id:crypto.randomUUID(),createdAt:new Date().toISOString(),context,sources:overview.aiSources || overview.sources,cardId:drawCard().id,reading:'',messages:[],question:''};save(current);}
      const request=new AbortController();active.current=request;setBusy(true);setError('');
      const timeout=setTimeout(()=>request.abort(),50000);
      try{
        const response=await fetch('/api/reading',{method:'POST',headers:{'Content-Type':'application/json'},signal:request.signal,body:JSON.stringify({kind:'summary',context:current.context,sources:current.sources,cardId:current.cardId})});
        const data=await response.json();
        if(!response.ok || typeof data.text!=='string')throw Error(({balance:'Falta saldo en DeepSeek.',rate_limit:'Esperá un minuto antes de reintentar.',not_configured:'La conexión con DeepSeek no está configurada.'})[data.error] || 'No se pudo preparar la lectura. Podés reintentar con la misma carta.');
        if(!request.signal.aborted){save({...current,reading:data.text,messages:[],question:''});heading.current?.focus({preventScroll:true});}
      }finally{clearTimeout(timeout);}
    }catch(e){setError(e.name==='AbortError'?'La lectura se interrumpió. Tu carta quedó guardada; podés reintentar.':'No se pudo preparar la lectura. Tu carta está disponible para reintentar. '+(e instanceof TypeError || e instanceof SyntaxError?'':e.message));}
    finally{active.current=null;setBusy(false);}
  }
  const card=session?TAROT[session.cardId]:null;
  return <div className="daily-journey">
    <span className="eyebrow">TU LECTURA DE HOY</span>
    <h2 ref={heading} tabIndex={-1}>{session?.reading?'Una mirada a tu día':busy?'Uniendo las miradas de tu día…':'Descubrí tu día'}</h2>
    {!session?.reading && <><p>Tu carta y tus métodos del día, unidos en una lectura. Después, podemos conversar sobre lo que te interese.</p>{card && <p className="daily-card-context">Te acompaña <strong>{card.name}</strong>. La lectura integra también tus ciclos, números y referencias del día.</p>}<button className="button primary" onClick={discover} disabled={busy}>{busy?'Preparando tu lectura…':session?'Reintentar mi lectura':'Descubrí tu día'}</button><p className="ai-note">Este paso saca una carta y prepara la lectura con DeepSeek. Usa tu saldo de API.</p></>}
    <p role="status">{error}</p>
    {storageError && <p role="alert">El navegador no pudo guardar los cambios. Podés continuar, pero podrían perderse al cerrar o recargar.</p>}
    {session?.reading && <><p className="daily-card-context">Tu carta de acompañamiento: <strong>{card.name}</strong></p><ReadingText text={session.reading}/><button className="button secondary" disabled={busy} onClick={discover}>{busy?'Actualizando…':'Actualizar lectura con la misma carta'}</button><p className="ai-note">Incluye los métodos actuales y el cierre de integración. Usa saldo de API y, si tiene éxito, inicia una nueva conversación.</p><p className="daily-saved">Lectura del {session.context} · {storageError?'Sin guardar':'Guardada en este navegador'}</p><ReadingConversation key={session.id+session.reading} payload={{kind:'summary',context:session.context,sources:session.sources,cardId:session.cardId}} reading={session.reading} initialMessages={session.messages} initialQuestion={session.question} onPersist={(messages,question)=>save({...session,messages,question})} inline/></>}
    <details className="daily-explore"><summary>Explorar los detalles</summary><p>Podés consultar cada método sin salir de tu lectura guardada al volver.</p><a href="/ciclos.html">Ver los datos e interpretaciones de mis ciclos →</a>{card && <div><h3>{card.name}</h3><p>{card.text}</p><p>{card.action}</p></div>}</details>
  </div>;
}
