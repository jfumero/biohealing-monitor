import * as Astro from 'astronomy-engine';
import {eclipticLongitude} from './cycle-calculations.js';
export const SIGNS=['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'];
const BODIES=[['Sun','Sol','identidad y propósito'],['Moon','Luna','necesidades y cuidado'],['Mercury','Mercurio','comunicación'],['Venus','Venus','vínculos y valores'],['Mars','Marte','iniciativa y límites'],['Jupiter','Júpiter','aprendizaje y expansión'],['Saturn','Saturno','responsabilidad y estructura'],['Uranus','Urano','cambio y autonomía'],['Neptune','Neptuno','imaginación y sensibilidad'],['Pluto','Plutón','transformación']];
export const normalize=v=>((v%360)+360)%360;
export const separation=(a,b)=>Math.abs(((a-b+540)%360)-180);
export function position(longitude){const value=normalize(longitude);return {longitude:value,sign:SIGNS[Math.floor(value/30)],degree:value%30};}
export function ascendant(date,lat,lon){
  const time=Astro.MakeTime(date),observer=new Astro.Observer(lat,lon,0);
  const eq=Astro.Rotation_ECT_EQD(time),hor=Astro.Rotation_EQD_HOR(time,observer);
  const convert=(x,y)=>Astro.RotateVector(hor,Astro.RotateVector(eq,new Astro.Vector(x,y,0,time)));
  const x=convert(1,0),y=convert(0,1);
  if(Math.hypot(x.z,y.z)<1e-10)return null;
  let angle=Math.atan2(-x.z,y.z);
  // Horizontal y points west: choose the eastern intersection, not the descendant.
  if(convert(Math.cos(angle),Math.sin(angle)).y>0)angle+=Math.PI;
  return position(angle*180/Math.PI);
}
export function aspects(first,second=null,orb=3){
  const definitions=[[0,'conjunción','reunir'],[60,'sextil','colaborar'],[90,'cuadratura','ajustar tensiones'],[120,'trígono','aprovechar afinidades'],[180,'oposición','equilibrar perspectivas']];
  const result=[];
  first.forEach((a,i)=>(second||first.slice(i+1)).forEach(b=>{
    const distance=separation(a.longitude,b.longitude);
    for(const [angle,name,theme] of definitions){const delta=Math.abs(distance-angle);if(delta<=orb)result.push({from:a.name,to:b.name,aspect:name,orb:Number(delta.toFixed(2)),theme});}
  }));
  return result.sort((a,b)=>a.orb-b.orb);
}
export function westernChart({birthInstant,targetInstant,birthLat,birthLon,birthTimeKnown=true}){
  try{
    const planets=date=>BODIES.map(([body,name,theme])=>({name,theme,...position(eclipticLongitude(Astro.Body[body],date))}));
    const natal=planets(birthInstant),current=planets(targetInstant);
    const locationKnown=birthLat!=='' && birthLon!=='' && birthLat!=null && birthLon!=null && Number.isFinite(Number(birthLat)) && Number.isFinite(Number(birthLon)) && Math.abs(Number(birthLat))<=90 && Math.abs(Number(birthLon))<=180;
    const rising=birthTimeKnown && locationKnown?ascendant(birthInstant,Number(birthLat),Number(birthLon)):null;
    const first=rising?Math.floor(rising.longitude/30):null;
    const houses=rising?Array.from({length:12},(_,i)=>({house:i+1,sign:SIGNS[(first+i)%12]})):[];
    natal.forEach(p=>{if(rising)p.house=(Math.floor(p.longitude/30)-first+12)%12+1;});
    // Without reliable birth time, exclude lunar natal aspects/transits (daily motion is significant).
    const stableNatal=birthTimeKnown?natal:natal.filter(p=>p.name!=='Luna');
    const natalAspects=aspects(stableNatal,null,6);
    const transits=aspects(current,stableNatal,2).slice(0,8);
    const points=natal.filter(p=>p.name==='Sol'||(p.name==='Luna'&&birthTimeKnown)).map(p=>`${p.name} natal en ${p.sign}`);
    if(rising)points.push(`Ascendente en ${rising.sign}`);
    const text=`${points.join('; ')}. ${transits.length?`En el momento elegido: ${transits.slice(0,3).map(t=>`${t.from} actual en ${t.aspect} con ${t.to} natal (orbe ${t.orb}°): ${t.theme}`).join('; ')}.`:'No hay aspectos dentro del orbe elegido; no se fuerza una coincidencia.'} Las conexiones son propuestas simbólicas, no acontecimientos garantizados.`;
    return {natal,current,ascendant:rising,houses,natalAspects,transits,birthTimeKnown,text,houseSystem:'Signos enteros',zodiac:'Tropical',note:!birthTimeKnown?'Hora no confirmada: posiciones calculadas al mediodía local, sin Luna natal interpretada, ascendente ni casas.':!locationKnown?'Completá las coordenadas de nacimiento para calcular ascendente y casas.':'Casas por signos enteros; posiciones geocéntricas tropicales.'};
  }catch{return {error:'No se pudo calcular la carta con estos datos.',text:'Carta occidental no disponible.'};}
}
export function westernAIContext(chart){
  if(chart.error)return chart.text;
  const compact=items=>items.map(({name,sign,degree,house})=>({name,sign,degree:Number(degree.toFixed(2)),...(house?{house}:{})}));
  return JSON.stringify({natal:compact(chart.birthTimeKnown?chart.natal:chart.natal.filter(p=>p.name!=='Luna')),momento:compact(chart.current),ascendente:chart.ascendant,casas:chart.houses,aspectosNatales:chart.natalAspects.slice(0,6),transitos:chart.transits,nota:chart.note,zodiaco:chart.zodiac,sistemaCasas:chart.houseSystem});
}
