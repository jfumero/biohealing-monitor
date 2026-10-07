export const DAILY_KEY='biohealing_daily_v1';
export function dailyIdentity(profile,day){const saved={...profile};if(saved.birthLat==='')delete saved.birthLat;if(saved.birthLon==='')delete saved.birthLon;if(saved.birthTimeKnown===false)delete saved.birthTimeKnown;return JSON.stringify([day,saved]);}
export function readDaily(identity,storage){
  try{
    const store=storage ?? globalThis.localStorage;
    const raw=store?.getItem(DAILY_KEY);
    if(!raw || raw.length>600000)return null;
    const data=JSON.parse(raw);
    if(data.version!==1 || data.identity!==identity || typeof data.id!=='string' || typeof data.context!=='string' || !Number.isInteger(data.cardId) || data.cardId<0 || data.cardId>21)return null;
    if(!Array.isArray(data.sources) || (data.sources.length<9 || data.sources.length>10) || !data.sources.every(r=>Array.isArray(r)&&r.length===2&&r.every(v=>typeof v==='string')&&r[1].length<=4000))return null;
    if(typeof data.reading!=='string' || data.reading.length>9000 || typeof data.question!=='string' || data.question.length>1000)return null;
    if(!Array.isArray(data.messages)||data.messages.length>100 || data.messages.length%2 || !data.messages.every((m,i)=>m.role===(i%2?'assistant':'user')&&typeof m.content==='string'&&m.content.length<=(i%2?9000:1000)))return null;
    return data;
  }catch{return null;}
}
export function saveDaily(data,storage){
  try{(storage ?? globalThis.localStorage).setItem(DAILY_KEY,JSON.stringify(data));return true;}catch{return false;}
}
