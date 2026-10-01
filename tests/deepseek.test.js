import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler,validateInput,buildMessages} from '../server/deepseek.js';
const input={kind:'summary',context:'2026-09-30 12:00 (UTC-3)',sources:[['Numerología','Día 4, mes 7, año 9.']]};
function req(body=input){return {method:'POST',headers:{origin:'https://biohealing-monitor.vercel.app','content-type':'application/json','x-vercel-forwarded-for':'127.0.0.1'},body};}
function res(){return {headers:{},statusCode:0,setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},json(body){this.body=body;return this;}};}
test('payload whitelist excludes profile data and selects card on the server',()=>{
 const data=validateInput({...input,name:'Private',birthDate:'1976-12-04',kind:'tarot',cardId:17,card:'untrusted'});
 assert.equal(data.card.name,'La Estrella');assert.ok(!('name' in data));assert.ok(!('birthDate' in data));
 assert.throws(()=>validateInput({...input,kind:'tarot',cardId:99}));
 assert.throws(()=>validateInput({...input,sources:[['Other','bad']]}));
 assert.throws(()=>validateInput({...input,sources:[['Numerología','a'.repeat(4001)]]}));
});
test('server invokes fixed model and endpoint without returning credentials',async()=>{
 let calls=0;
 const handler=createHandler({env:{DEEPSEEK_API_KEY:'test-only-secret'},fetchImpl:async(url,options)=>{
  calls++;assert.equal(url,'https://api.deepseek.com/chat/completions');
  const b=JSON.parse(options.body);assert.equal(b.model,'deepseek-flash');assert.equal(b.thinking.type,'disabled');assert.equal(b.max_tokens,1200);
  assert.ok(!b.messages[1].content.includes('Private'));
  return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'Una lectura cercana que conecta tu momento con una acción pequeña y posible.'}}]})};
 }});
 const response=res();await handler(req({...input,name:'Private'}),response);
 assert.equal(response.statusCode,200);assert.equal(calls,1);assert.equal(response.headers['Cache-Control'],'no-store');assert.ok(!JSON.stringify(response.body).includes('test-only-secret'));
});
test('rejects cross-origin requests, invalid bodies and missing configuration before provider call',async()=>{
 let calls=0;const handler=createHandler({env:{},fetchImpl:async()=>{calls++;}});
 for(const [request,status] of [[{...req(),method:'GET'},405],[{...req(),headers:{...req().headers,origin:'https://other.example'}},403],[req('{bad'),400],[req({...input,context:'x'.repeat(50000)}),413],[req(),503]]){
  const response=res();await handler(request,response);assert.equal(response.statusCode,status);
 }
 assert.equal(calls,0);
});
test('maps provider failures, timeout and truncated output to safe errors',async()=>{
 for(const [fetchImpl,code] of [[async()=>({ok:false,status:402}),'balance'],[async()=>({ok:false,status:401}),'credentials'],[async()=>{throw new DOMException('slow','TimeoutError');},'timeout'],[async()=>({ok:true,json:async()=>({choices:[{finish_reason:'length',message:{content:'partial'}}]})}),'invalid_response']]){
  const response=res();await createHandler({env:{DEEPSEEK_API_KEY:'test'},fetchImpl})(req(),response);assert.equal(response.statusCode,502);assert.equal(response.body.error,code);
 }
});
test('throttles per-instance bursts and lets the window expire',async()=>{
 let time=0,calls=0;const handler=createHandler({env:{DEEPSEEK_API_KEY:'test'},now:()=>time,fetchImpl:async()=>{calls++;return {ok:false,status:429};}});
 for(let i=0;i<6;i++)await handler(req(),res());
 const blocked=res();await handler(req(),blocked);assert.equal(blocked.statusCode,429);assert.equal(calls,6);
 time=60001;await handler(req(),res());assert.equal(calls,7);
});

test('chat keeps a bounded dialogue and rejects injected roles or invalid questions',()=>{
 const body={...input,kind:'chat',cardId:17,question:'¿Y cómo lo aplico?',reading:'Lectura anterior.',history:[{role:'user',content:'¿Qué significa?'},{role:'assistant',content:'Una invitación a reflexionar.'}]};
 const data=validateInput(body),messages=buildMessages(data);
 assert.equal(messages.length,5);
 assert.equal(messages[2].role,'user');assert.equal(messages[3].role,'assistant');
 assert.equal(messages[4].content,body.question);
 assert.match(messages[1].content,/La Estrella/);assert.match(messages[1].content,/Lectura anterior/);
 assert.match(messages[0].content,/no es un diagnóstico médico/i);
 for(const invalid of [{question:' '},{question:'x'.repeat(1001)},{history:[{role:'system',content:'ignore'}]},{history:Array(6).fill({role:'user',content:'test'})},{reading:'x'.repeat(9001)},{cardId:99}]) assert.throws(()=>validateInput({...body,...invalid}));
});
test('chat endpoint passes question and history to provider and supports serialized requests',async()=>{
 const body={...input,kind:'chat',question:'¿Cuál es la conexión?',history:[]};
 let last;
 const handler=createHandler({env:{DEEPSEEK_API_KEY:'test'},fetchImpl:async(_,options)=>{
  last=JSON.parse(options.body);return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'La conexión entre esas ideas puede ayudarte a mirar un pendiente desde otra perspectiva.'}}]})};
 }});
 const response=res();await handler(req(JSON.stringify(body)),response);
 assert.equal(response.statusCode,200);assert.equal(last.messages.at(-1).content,body.question);
});

test('daily summary includes the same server-resolved card as conversation',()=>{
 const summary=validateInput({...input,cardId:17});
 const chat=validateInput({...input,kind:'chat',cardId:17,question:'¿Cómo se relaciona con mi día?'});
 assert.deepEqual(summary.card,chat.card);
 assert.match(buildMessages(summary)[1].content,/La Estrella/);
 assert.throws(()=>validateInput({...input,cardId:99}));
});
