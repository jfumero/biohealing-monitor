import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarAge, lifeSnapshot, conceptionDate } from '../src/life-clock.js';
import { normalizeProfile, readProfile, writeProfile } from '../src/profile.js';
const profile = normalizeProfile({birthDate:'1976-12-04',birthTime:'00:43',birthUtcOffset:-3});
test('age uses the configured birth offset and advances exactly at birth time', () => {
  assert.deepEqual(lifeSnapshot(profile,new Date('2026-12-04T03:42:59Z')).age,[49,11,29,23,59,59]);
  assert.deepEqual(lifeSnapshot(profile,new Date('2026-12-04T03:43:00Z')).age,[50,0,0,0,0,0]);
  assert.deepEqual(lifeSnapshot(profile,new Date('2026-12-04T03:43:01Z')).age,[50,0,0,0,0,1]);
  assert.equal(lifeSnapshot(profile,new Date('2026-12-04T02:59:59Z')).birthday,false);
  assert.equal(lifeSnapshot(profile,new Date('2026-12-04T03:00:00Z')).birthday,true);
});
test('calendar months clamp at the end of month, including leap birthdays', () => {
  assert.deepEqual(calendarAge(new Date('2024-01-31T12:00Z'),new Date('2024-03-01T12:00Z')),[0,1,1,0,0,0]);
  const leap = normalizeProfile({birthDate:'2000-02-29',birthTime:'00:00',birthUtcOffset:0});
  assert.deepEqual(lifeSnapshot(leap,new Date('2025-02-28T00:00Z')).age,[25,0,0,0,0,0]);
  assert.equal(lifeSnapshot(leap,new Date('2025-02-28T00:00Z')).birthday,true);
  assert.equal(lifeSnapshot(leap,new Date('2024-02-28T00:00Z')).birthday,false);
  assert.equal(calendarAge(new Date('2030-01-01'),new Date('2026-01-01')),null);
});
test('estimated conception is 266 days before birth and adjustable without losing settings', () => {
  const date=conceptionDate(profile);
  assert.equal((new Date(`${profile.birthDate}T00:00Z`)-new Date(`${date}T00:00Z`))/86400000,266);
  const custom=normalizeProfile({...profile,conceptionDate:'1976-03-20',birthUtcOffset:-2.5});
  let raw; const storage={setItem:(_,v)=>raw=v,getItem:()=>raw};
  assert.equal(writeProfile(custom,storage),true);
  assert.deepEqual(readProfile(storage),custom);
  assert.equal(conceptionDate(custom),'1976-03-20');
  assert.equal(normalizeProfile({...profile,conceptionDate:'2026-01-01'}).conceptionDate,'');
  assert.equal(normalizeProfile({tz:5.5}).birthUtcOffset,5.5);
});
