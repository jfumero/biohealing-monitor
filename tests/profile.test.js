import test from 'node:test';
import assert from 'node:assert/strict';
import { readProfile, writeProfile, DEFAULT_PROFILE, PROFILE_KEY, validDate, biorhythm, dayDistance, zodiac } from '../src/profile.js';
import { bioVal, planetaryHours } from '../src/cycle-calculations.js';

test('existing profiles survive migration and writes preserve all profile fields', () => {
  let raw=JSON.stringify({name:'Perfil de prueba',birthDate:'2000-02-29',birthTime:'15:30',lat:40.4,lon:-3.7,tz:2,dateStr:'2020-01-01'});
  const storage={getItem:key=>{assert.equal(key,PROFILE_KEY);return raw;},setItem:(key,value)=>{assert.equal(key,PROFILE_KEY);raw=value;}};
  const profile=readProfile(storage);
  assert.equal(profile.name,'Perfil de prueba');
  assert.equal(profile.birthDate,'2000-02-29');
  assert.equal(writeProfile(profile,storage),true);
  assert.deepEqual(readProfile(storage),profile);
});
test('invalid or unavailable storage cannot crash either page', () => {
  assert.deepEqual(readProfile({getItem:()=>'{broken'}),DEFAULT_PROFILE);
  const blocked={getItem:()=>{throw Error('blocked');},setItem:()=>{throw Error('full');}};
  assert.deepEqual(readProfile(blocked),DEFAULT_PROFILE);
  assert.equal(writeProfile(DEFAULT_PROFILE,blocked),false);
  assert.equal(validDate('2025-02-29'),false);
  assert.equal(validDate('2000-02-29'),true);
});
test('monitor and cycles share daily biorhythms regardless of birth time', () => {
  const target=new Date(2026,8,16,12);
  const birth=new Date(1976,11,4,23,59);
  assert.equal(dayDistance(birth,target),dayDistance(new Date(1976,11,4,0),target));
  for(const period of [23,28,33]) assert.equal(bioVal(birth,target,period)*100,biorhythm(birth,target,period));
});
test('zodiac boundaries and planetary hours remain usable', () => {
  assert.equal(zodiac(new Date(2000,2,21)),'Aries');
  assert.equal(zodiac(new Date(2000,11,4)),'Sagitario');
  const result=planetaryHours(new Date(2026,8,16,12),-34.86,-55.97,-3);
  assert.equal(result.rows.length,24);
  assert.equal(result.lord,'Mercurio');
  for(const row of result.rows) assert.ok(row.end>row.start);
});
