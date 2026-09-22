const DAY = 86400000;
// Work in a fixed birth offset so travelling never changes the displayed age.
export function birthCivil(profile) { return new Date(`${profile.birthDate}T${profile.birthTime || '00:00'}:00Z`); }
export function conceptionDate(profile) {
  return profile.conceptionDate || new Date(+birthCivil(profile) - 266 * DAY).toISOString().slice(0, 10);
}
export function addMonths(date, months) {
  const result = new Date(+date);
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const last = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(date.getUTCDate(), last));
  return result;
}
export function calendarAge(start, now) {
  if (!Number.isFinite(+start) || !Number.isFinite(+now) || now < start) return null;
  let months = (now.getUTCFullYear() - start.getUTCFullYear()) * 12 + now.getUTCMonth() - start.getUTCMonth();
  if (addMonths(start, months) > now) months--;
  let seconds = Math.floor((now - addMonths(start, months)) / 1000);
  const days = Math.floor(seconds / 86400); seconds %= 86400;
  const hours = Math.floor(seconds / 3600); seconds %= 3600;
  const minutes = Math.floor(seconds / 60); seconds %= 60;
  return [Math.floor(months / 12), months % 12, days, hours, minutes, seconds];
}
export function lifeSnapshot(profile, instant = new Date()) {
  const now = new Date(+instant + profile.birthUtcOffset * 3600000);
  const birth = birthCivil(profile);
  const anniversary = addMonths(birth, (now.getUTCFullYear() - birth.getUTCFullYear()) * 12);
  const birthday = anniversary.toISOString().slice(0,10) === now.toISOString().slice(0,10) && now >= birth;
  return { age: calendarAge(birth, now), prenatal: calendarAge(new Date(`${conceptionDate(profile)}T00:00:00Z`), now), birthday, birthdayKey: `${profile.birthDate}:${now.getUTCFullYear()}`, conception: conceptionDate(profile) };
}
