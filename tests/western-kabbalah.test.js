import test from 'node:test';
import assert from 'node:assert/strict';
import * as Astro from 'astronomy-engine';
import {ascendant,aspects,separation,westernChart,westernAIContext} from '../src/western-astrology.js';
import {kabbalahForDay,SEFIROT} from '../src/kabbalah.js';
import {normalizeProfile} from '../src/profile.js';
import {validateInput,buildMessages} from '../server/deepseek.js';
import {dailyIdentity,readDaily,saveDaily} from '../src/daily-session.js';
const input={birthInstant:new Date('1976-12-04T03:49:00Z'),targetInstant:new Date('2026-10-07T15:00:00Z'),birthLat:-34.9,birthLon:-56.2,birthTimeKnown:true};
test('ascendant lies on the eastern geometric horizon in both hemispheres',()=>{
 for(const [lat,lon] of [[-34.9,-56.2],[51.5,0],[0,0],[70,10]]){
 const time=Astro.MakeTime(input.birthInstant),a=ascendant(time,lat,lon),r=a.longitude*Math.PI/180;
 const equatorial=Astro.RotateVector(Astro.Rotation_ECT_EQD(time),new Astro.Vector(Math.cos(r),Math.sin(r),0,time));
 const horizontal=Astro.RotateVector(Astro.Rotation_EQD_HOR(time,new Astro.Observer(lat,lon,0)),equatorial);
 assert.ok(Math.abs(horizontal.z)<1e-10);assert.ok(horizontal.y<0);
 }
});
test('tropical positions, whole-sign houses, and transits stay distinct and change with time',()=>{
 const a=westernChart(input),b=westernChart({...input,targetInstant:new Date('2026-10-08T15:00:00Z')});
 assert.equal(a.natal.length,10);assert.equal(a.houses.length,12);assert.equal(a.natal[0].sign,'Sagitario');
 assert.deepEqual(a.natal,b.natal);assert.notDeepEqual(a.current,b.current);assert.notDeepEqual(a.transits,b.transits);
 for(const p of a.natal)assert.ok(p.longitude>=0&&p.longitude<360&&p.house>=1&&p.house<=12);
 assert.equal(a.houses[0].sign,a.ascendant.sign);
 const data=westernAIContext(a);assert.ok(data.length<=4000);assert.ok(!data.includes('birthInstant')&&!data.includes('birthLat'));
});
test('missing birth location or unconfirmed time omits unsupported angles and lunar claims',()=>{
 const missing=westernChart({...input,birthLat:'',birthLon:''});assert.equal(missing.ascendant,null);assert.equal(missing.houses.length,0);
 const uncertain=westernChart({...input,birthTimeKnown:false});assert.equal(uncertain.ascendant,null);
 const data=JSON.parse(westernAIContext(uncertain));assert.ok(!data.natal.some(p=>p.name==='Luna'));assert.ok(uncertain.transits.every(a=>a.to!=='Luna'));
 const old=normalizeProfile({birthDate:'1976-12-04',lat:-34.9,lon:-56.2});assert.equal(old.birthLat,'');assert.equal(old.birthTimeKnown,false);
});
test('aspects handle zodiac wrap and do not force a result outside orb',()=>{
 assert.equal(separation(359,1),2);
 assert.equal(aspects([{name:'A',longitude:359}],[{name:'B',longitude:1}],2)[0].aspect,'conjunción');
 assert.equal(aspects([{name:'A',longitude:0}],[{name:'B',longitude:15}],2).length,0);
});
test('editorial sefirot cycle is date-based, complete and not tied to birth numbers',()=>{
 const seen=new Set();for(let i=1;i<=10;i++)seen.add(kabbalahForDay(`2026-10-${String(i).padStart(2,'0')}`).name);
 assert.equal(seen.size,SEFIROT.length);assert.equal(kabbalahForDay('2026-10-01').name,kabbalahForDay('2026-10-11').name);
 assert.match(kabbalahForDay('2026-10-01').method,/editorial/);
});
test('ten-method context survives server validation and local persistence',()=>{
 const names=['Numerología','Biorritmos','Sello y tono','Runas','Occidental','Chino','Horas planetarias','Jyotish','Human Design','Cábala'];
 const sources=names.map(n=>[n,n==='Occidental'?westernAIContext(westernChart(input)):'Información simbólica']);
 const data=validateInput({kind:'summary',context:'2026-10-07',sources,cardId:0});assert.equal(data.sources.length,10);
 const prompt=buildMessages(data)[0].content;assert.match(prompt,/Para integrar hoy:/);assert.match(prompt,/Tu frase del día:/);
 const identity=dailyIdentity({name:'Test',birthLat:'',birthLon:'',birthTimeKnown:false},'2026-10-07');assert.equal(identity,dailyIdentity({name:'Test'},'2026-10-07'));
 let raw;const storage={setItem:(k,v)=>raw=v,getItem:()=>raw};const record={version:1,identity,id:'test',context:'2026-10-07',sources,cardId:0,reading:'',messages:[],question:''};saveDaily(record,storage);assert.deepEqual(readDaily(identity,storage),record);
});
