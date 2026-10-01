import test from 'node:test';
import assert from 'node:assert/strict';
import { TAROT, drawCard } from '../src/tarot.js';
import { validateInput } from '../server/deepseek.js';
import { generalReading } from '../src/general-reading.js';
const input={num:{pd:1,pm:4,py:9},bio:{physical:80,emotional:-60,intellectual:20},maya:{seal:'Kan',tone:4,toneDesc:'Definición'},sealIndex:3,runes:{natal:{name:'Ansuz',meaning:'Comunicación'},year:{name:'Gebo',meaning:'Intercambio'}},occidental:'Sagitario',chino:{animal:'Dragón',element:'Fuego'},jyotish:{mahadasha:{lord:'Saturn'},nakshatra:{lord:'Moon'}},hd:{profile:'1/3',gatePers:{line:1},gateDes:{line:3}},planetHours:{lord:'Sol',rows:[{planet:'Luna',start:new Date(0),end:new Date(10000)}]},target:new Date(5000)};
test('every card is reachable and contains a complete original reading',()=>{
  assert.equal(TAROT.length,22);
  for(let i=0;i<22;i++){
    const card=drawCard({getRandomValues:values=>{values[0]=i;}});
    assert.equal(card.id,i);
    for(const key of ['name','theme','text','action','question'])assert.ok(card[key]);
  }
});
test('random draw rejects the biased upper tail and permits independent repeats',()=>{
  let calls=0;
  const source={getRandomValues:v=>{v[0]=calls++===0?4294967295:21;}};
  assert.equal(drawCard(source).id,21);assert.equal(calls,2);
  assert.equal(drawCard(source).id,21);
});
test('synthesis combines available methods, detects repeated themes and changes with inputs',()=>{
  const a=generalReading(input);
  assert.equal(a.sources.length,9);
  assert.match(a.paragraphs[0],/repiten el tema/);
  assert.match(a.paragraphs[1],/contrastan/);
  const b=generalReading({...input,num:{...input.num,pd:7},planetHours:{error:'missing'},jyotish:{error:'missing'},hd:{error:'missing'}});
  assert.notEqual(a.title,b.title);assert.notEqual(a.action,b.action);
  assert.ok(!JSON.stringify(b).includes('undefined'));
  assert.ok(!b.paragraphs[0].includes('repiten el tema'));
});

test('AI context preserves detailed values, remains valid and keeps UI prose separate',()=>{
 const reading=generalReading({...input,num:{...input.num,lp:3,exp:1,soul:1,pers:9,mat:4}});
 const sources=reading.aiSources;
 assert.match(sources[0][1],/"caminoDeVida":3/);
 assert.match(sources[1][1],/"physical":80/);
 assert.match(sources[6][1],/1970-01-01T00:00:00.000Z/);
 assert.ok(!reading.sources[0][1].includes('Datos calculados'));
 assert.equal(validateInput({kind:'summary',context:'2026-09-30',sources,cardId:0}).card.name,TAROT[0].name);
});

test('all 24 planetary hours fit the validated daily context',()=>{
 const rows=Array.from({length:24},(_,i)=>({idx:i+1,planet:'Mercurio',phase:i<12?'Día':'Noche',start:new Date(2026,8,30,i),end:new Date(2026,8,30,i+1)}));
 const sources=generalReading({...input,planetHours:{lord:'Mercurio',rows}}).aiSources;
 assert.ok(sources.every(([,text])=>text.length<=4000));
 assert.equal(validateInput({kind:'summary',context:'2026-09-30',sources,cardId:17}).sources.length,9);
});
