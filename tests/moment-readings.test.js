import test from 'node:test';
import assert from 'node:assert/strict';
import { bioReading, numberReading, mayaReading, planetReading, jyotishReading, hdReading, westernReading, chineseReading, agendaReading } from '../src/moment-readings.js';
import { DEFAULT_PROFILE, normalizeProfile, readProfile, writeProfile } from '../src/profile.js';
test('corrects the old owner birth time once and preserves other profiles and later edits',()=>{
  const old={...DEFAULT_PROFILE,birthTime:'00:43'};delete old.birthTimeRevision;
  assert.equal(normalizeProfile(old).birthTime,'00:49');
  assert.equal(normalizeProfile({...old,name:'Otra persona'}).birthTime,'00:43');
  assert.equal(normalizeProfile({...old,birthTimeRevision:1}).birthTime,'00:43');
  let raw=JSON.stringify(old);const storage={getItem:()=>raw,setItem:(_,v)=>raw=v};
  writeProfile(readProfile(storage),storage);
  assert.equal(readProfile(storage).birthTime,'00:49');
});
test('daily readings respond to changes in the calculated values',()=>{
  const a=numberReading({pd:1,pm:4,py:9}),b=numberReading({pd:7,pm:4,py:9});
  assert.notEqual(a.action,b.action);assert.match(a.text,/mes 4/);assert.match(a.text,/año 9/);
  assert.match(bioReading({physical:80,emotional:-60,intellectual:20}).title,/contrastan/);
  assert.match(bioReading({physical:0,emotional:0,intellectual:0}).title,/transición/);
  assert.notEqual(mayaReading({seal:'A',tone:1},0).action,mayaReading({seal:'B',tone:12},4).action);
  assert.notEqual(westernReading('Sagitario',1).text,westernReading('Sagitario',7).text);
  assert.notEqual(chineseReading({animal:'Dragón',element:'Fuego'},1).text,chineseReading({animal:'Dragón',element:'Fuego'},7).text);
  assert.notEqual(agendaReading({pd:1}),agendaReading({pd:9}));
});
test('hour selection uses start-inclusive, end-exclusive intervals, with an honest fallback',()=>{
  const hours={lord:'Sol',rows:[{planet:'Luna',start:new Date('2026-09-29T12:00Z'),end:new Date('2026-09-29T13:00Z')},{planet:'Marte',start:new Date('2026-09-29T13:00Z'),end:new Date('2026-09-29T14:00Z')}]};
  assert.match(planetReading(hours,new Date('2026-09-29T12:00Z')).title,/Luna/);
  assert.match(planetReading(hours,new Date('2026-09-29T13:00Z')).title,/Marte/);
  assert.match(planetReading(hours,new Date('2026-09-29T11:00Z')).text,/fuera del tramo/);
  assert.match(planetReading({error:'invalid'},new Date()).title,/no disponible/);
});
test('Jyotish combines moment and natal period; HD does not pretend a daily transit',()=>{
  const j=jyotishReading({mahadasha:{lord:'Saturn'},nakshatra:{name:'Rohini',lord:'Moon'}});
  assert.match(j.text,/estructura y límites/);assert.match(j.text,/escucha y cuidado/);
  const h=hdReading({profile:'1/3',gatePers:{line:1},gateDes:{line:3}},4);
  assert.match(h.text,/No es un tránsito diario/);assert.match(h.action,/Investiga/);
  assert.match(jyotishReading({error:'x'}).title,/no disponible/);
});
