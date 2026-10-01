import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyIdentity,readDaily,saveDaily,DAILY_KEY} from '../src/daily-session.js';
const identity=dailyIdentity({name:'Test',birthTime:'00:49'},'2026-10-01');
const record={version:1,identity,id:'example',context:'2026-10-01 08:00 (UTC-3)',cardId:0,sources:Array.from({length:9},(_,i)=>['Method '+i,'data']),reading:'Lectura completa',messages:[{role:'user',content:'Pregunta'},{role:'assistant',content:'Respuesta'}],question:'Borrador'};
function storage(){const data=new Map();return {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};}
test('restores the same card, reading, conversation and draft only for the same day/profile',()=>{
 const s=storage();assert.equal(saveDaily(record,s),true);assert.deepEqual(readDaily(identity,s),record);
 assert.equal(readDaily(dailyIdentity({name:'Test',birthTime:'00:49'},'2026-10-02'),s),null);
 assert.equal(readDaily(dailyIdentity({name:'Test',birthTime:'01:49'},'2026-10-01'),s),null);
});
test('interrupted generation restores the card without a completed reading',()=>{
 const s=storage(),pending={...record,reading:'',messages:[],question:''};saveDaily(pending,s);assert.deepEqual(readDaily(identity,s),pending);
});
test('corrupt data, invalid cards and blocked storage fail safely',()=>{
 const s=storage();s.setItem(DAILY_KEY,'{');assert.equal(readDaily(identity,s),null);
 for(const patch of [{cardId:22},{messages:[{role:'system',content:'invalid'}]},{question:'x'.repeat(1001)},{sources:[]},{reading:null}]){saveDaily({...record,...patch},s);assert.equal(readDaily(identity,s),null);}
 const denied={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
 assert.equal(readDaily(identity,denied),null);assert.equal(saveDaily(record,denied),false);
});
