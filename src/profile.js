export const PROFILE_KEY = 'cycles_app_state';
export const DEFAULT_PROFILE = { name: 'Jonathan Fumero Mesa', birthDate: '1976-12-04', birthTime: '00:43', lat: -34.86, lon: -55.97, tz: -3 };

export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const d = new Date(`${value}T12:00:00`);
  return Number.isFinite(+d) && localDate(d) === value;
}
export function localDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function normalizeProfile(value = {}) {
  const number = (key, min, max) => Number.isFinite(Number(value[key])) && value[key] !== '' && value[key] != null && Number(value[key]) >= min && Number(value[key]) <= max ? Number(value[key]) : DEFAULT_PROFILE[key];
  return {
    name: typeof value.name === 'string' ? value.name.slice(0, 100) : DEFAULT_PROFILE.name,
    birthDate: validDate(value.birthDate) ? value.birthDate : DEFAULT_PROFILE.birthDate,
    birthTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(value.birthTime || '') ? value.birthTime : DEFAULT_PROFILE.birthTime,
    lat: number('lat', -90, 90), lon: number('lon', -180, 180), tz: number('tz', -12, 14),
  };
}
export function readProfile(storage) {
  if (!storage && typeof window === 'undefined') return { ...DEFAULT_PROFILE };
  try { return normalizeProfile(JSON.parse((storage ?? globalThis.localStorage).getItem(PROFILE_KEY)) || {}); }
  catch { return { ...DEFAULT_PROFILE }; }
}
export function writeProfile(profile, storage) {
  try { (storage ?? globalThis.localStorage).setItem(PROFILE_KEY, JSON.stringify(normalizeProfile(profile))); return true; }
  catch { return false; }
}
export function birthFromProfile(profile) { return new Date(`${profile.birthDate}T${profile.birthTime || '00:00'}:00`); }
export function dayDistance(birth, target) {
  return Math.round((Date.UTC(target.getFullYear(), target.getMonth(), target.getDate()) - Date.UTC(birth.getFullYear(), birth.getMonth(), birth.getDate())) / 86400000);
}
export function biorhythm(birth, target, period) { return Math.round(Math.sin(2 * Math.PI * dayDistance(birth, target) / period) * 1000) / 10; }
export function zodiac(date) {
  const m = date.getMonth(), d = date.getDate();
  const edges = [20,19,21,20,21,21,23,23,23,23,22,22];
  const signs = ['Capricornio','Acuario','Piscis','Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio'];
  return signs[m + (d >= edges[m] ? 1 : 0)];
}
export function ageYears(birth, today = new Date()) {
  return today.getFullYear() - birth.getFullYear() - (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate()) ? 1 : 0);
}
