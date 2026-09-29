import { numberTheme, planetTheme, bioReading, mayaReading, westernReading, chineseReading, hdReading } from './moment-readings.js';
export function generalReading({num,bio,maya,sealIndex,runes,occidental,chino,jyotish,hd,planetHours,target}) {
  const [focus,action,question]=numberTheme(num.pd);
  const active=planetHours.rows?.find(r=>target>=r.start && target<r.end);
  const planet=active?.planet || (!planetHours.error && planetHours.lord);
  const lunar=!jyotish.error && jyotish.nakshatra?.lord;
  const long=!jyotish.error && jyotish.mahadasha?.lord;
  const themes=[planet && planetTheme(planet)[0],lunar && planetTheme(lunar)[0]].filter(Boolean);
  const same=themes.length===2 && themes[0]===themes[1];
  const extremes=Object.values(bio);
  const contrast=Math.max(...extremes)>=25 && Math.min(...extremes)<=-25;
  return {
    title:`${focus[0].toUpperCase()+focus.slice(1)}, a tu propio ritmo`,
    paragraphs:[
      `Al reunir estas lecturas, la propuesta es dar espacio a ${focus}, dentro de un mes de ${numberTheme(num.pm)[0]} y un año de ${numberTheme(num.py)[0]}. ${themes.length ? same ? `La hora planetaria y el regente lunar repiten el tema de ${themes[0]}: puedes usarlo como apoyo para ese propósito.` : `Las referencias planetarias añaden ${[...new Set(themes)].join(' y ')}: busca una acción que combine esos temas sin intentar atenderlos todos a la vez.` : 'Puedes partir de ese foco y observar cómo encaja con tu experiencia.'}`,
      `El sello ${maya.seal} y el tono ${maya.tone} (${maya.toneDesc}) aportan un matiz al día; la runa ${runes.year.name} invita a explorar ${runes.year.meaning.toLowerCase()}. ${long?`El período de ${jyotish.mahadasha.lord} sitúa esa exploración en un proceso más largo de ${planetTheme(long)[0]}. `:''}${contrast?'Las curvas de biorritmos contrastan entre sí: como imagen, sugieren alternar tus actividades, sin esperar el mismo ritmo en todo.':'Las curvas de biorritmos pueden servir como una pausa para observar cómo te encuentras, antes de decidir cuánto hacer.'}`,
      `Tu referencia natal —${occidental}, ${chino.animal} de ${chino.element}, runa ${runes.natal.name}${!hd.error?` y aproximación ${hd.profile} de Human Design`:''}— aporta preguntas de fondo, no un cambio diario de identidad. La idea común es elegir un paso coherente contigo, probarlo y ajustar según lo que realmente vivas.`
    ], action,question,
    sources:[['Numerología',`Día ${num.pd}, mes ${num.pm}, año ${num.py}: ${focus}.`],['Biorritmos',bioReading(bio).text],['Sello y tono',mayaReading(maya,sealIndex).text],['Runas',`${runes.natal.name}: ${runes.natal.meaning}. ${runes.year.name}: ${runes.year.meaning}.`],['Occidental',westernReading(occidental,num.pd).text],['Chino',chineseReading(chino,num.pd).text],['Horas planetarias',planet?`${active?'Hora':'Día'} de ${planet}: ${planetTheme(planet)[0]}.`:'Sin datos suficientes para esta ubicación.'],['Jyotish',lunar?`Regente lunar ${lunar}; período ${long || 'no disponible'}.`:'Lectura no disponible.'],['Human Design',hdReading(hd,num.pd).text]]
  };
}
