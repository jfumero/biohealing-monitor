// Editorial prompts for reflection, not predictions or measurements of wellbeing.
const NUM = {
  1:['iniciativa','Da un primer paso pequeño en algo que vienes postergando.','¿Qué quiero comenzar por decisión propia?'],
  2:['cooperación','Escucha una perspectiva diferente antes de responder.','¿Dónde puedo pedir o aportar compañía?'],
  3:['expresión','Escribe o comparte una idea que todavía no has expresado.','¿Qué me gustaría decir con más claridad?'],
  4:['estructura','Ordena una tarea y divídela en tres pasos realizables.','¿Qué base necesita atención?'],
  5:['exploración','Prueba una pequeña variante en tu rutina.','¿Qué cambio puedo explorar sin precipitarme?'],
  6:['cuidado','Dedica un gesto concreto a un vínculo o a tu espacio.','¿Cómo puedo cuidar sin cargar con todo?'],
  7:['introspección','Reserva diez minutos para escribir sin distracciones.','¿Qué necesito comprender antes de actuar?'],
  8:['organización de recursos','Revisa un compromiso y los recursos reales que requiere.','¿Qué resultado merece mi esfuerzo?'],
  9:['cierre','Termina un pendiente pequeño antes de abrir otro.','¿Qué puedo dar por concluido?'],
  11:['inspiración','Anota una intuición y una manera sencilla de contrastarla.','¿Cómo convierto una idea en algo concreto?'],
  22:['construcción','Elige el primer paso medible de un proyecto grande.','¿Qué estructura hará sostenible mi idea?'],
  33:['acompañamiento','Ofrece ayuda concreta respetando tus propios límites.','¿Cómo acompañar sin decidir por otros?'],
};
export function numberTheme(n) {
  if (NUM[n]) return NUM[n];
  const reduced = Math.abs(Number(n)) % 9 || 9;
  return NUM[reduced] || NUM[7];
}
export function numberReading(num) {
  const [day,action,question]=numberTheme(num.pd), [month]=numberTheme(num.pm), [year]=numberTheme(num.py);
  return {title:'Tu día dentro de un ciclo mayor',text:`El día personal ${num.pd} propone ${day}. Dentro de un mes ${num.pm} de ${month} y un año ${num.py} de ${year}, puedes usar ese foco como un paso pequeño al servicio de un proceso más largo.`,action,question};
}
export function bioReading(bio) {
  const values=[['físico',bio.physical],['emocional',bio.emotional],['intelectual',bio.intellectual]];
  const sorted=[...values].sort((a,b)=>b[1]-a[1]);
  const crossing=values.filter(([,v])=>Math.abs(v)<15).map(([k])=>k);
  const mixed=sorted[0][1]>=25 && sorted[2][1]<=-25;
  return {title:mixed?'Ritmos que contrastan':crossing.length?'Un punto de transición':'Una mirada a tus tres ritmos',
    text:`En las curvas calculadas, el ciclo ${sorted[0][0]} está más alto (${sorted[0][1]}%) y el ${sorted[2][0]} más bajo (${sorted[2][1]}%). ${mixed?'La imagen sugiere alternar actividades, en lugar de exigir el mismo ritmo en todo.':crossing.length?`El ciclo ${crossing.join(' y ')} pasa cerca del centro: úsalo como invitación a observar cambios, sin anticipar problemas.`:'Puedes tomar esta combinación como un recordatorio para revisar tu propio ritmo.'}`,
    action:'Anota cómo te sientes realmente y elige una tarea acorde a esa observación, aunque no coincida con las curvas.',question:'¿Qué parte de esta imagen coincide con mi experiencia y cuál no?'};
}
const SEEDS=['un comienzo','una conversación','el mundo interior','algo que quieres cultivar','tu atención al presente','un cierre','una tarea hecha con tus manos','la belleza cotidiana','lo que sientes','la confianza','el juego','una elección propia','tus apoyos','la escucha','una perspectiva amplia','una pregunta valiente','tu entorno','una mirada honesta','un cambio','algo que agradeces'];
const TONES=['definir un propósito','reconocer una tensión','poner algo al servicio de otros','dar forma a una idea','elegir una prioridad','buscar equilibrio','escuchar con atención','actuar con coherencia','sostener una intención','hacer algo tangible','soltar lo innecesario','colaborar','estar presente'];
export function mayaReading(maya, sealIndex) {
  const seed=SEEDS[sealIndex] || 'el presente', tone=TONES[maya.tone-1] || 'observar';
  return {title:`${maya.seal} · tono ${maya.tone}`,text:`En la lectura simbólica de esta app, el sello invita a mirar ${seed} y el tono propone ${tone}. Juntos ofrecen un foco para la fecha elegida, no una descripción de lo que tiene que ocurrirte.`,action:`Dedica cinco minutos a ${tone}, tomando como punto de partida ${seed}.`,question:`¿Qué lugar tiene ${seed} en lo que estoy viviendo?`};
}
const PLANETS={
  Sol:['expresión propia','Da forma a una idea que represente lo que quieres aportar.'], Luna:['escucha y cuidado','Haz una pausa para poner en palabras cómo te encuentras.'], Mercurio:['comunicación','Aclara un mensaje o una pregunta pendiente.'], Venus:['armonía y vínculos','Ten un gesto de aprecio o cuida un detalle de tu espacio.'], Marte:['iniciativa','Elige una acción breve y concreta, sin apresurar el resto.'], Júpiter:['aprendizaje','Explora una pregunta o una perspectiva nueva.'], Saturno:['estructura y límites','Acota una tarea y decide hasta dónde puedes comprometerte.'],
  Rahu:['exploración','Distingue una curiosidad propia de una expectativa ajena.'],Ketu:['desapego','Identifica un compromiso que quieras revisar.']
};
const ALIASES={Sun:'Sol',Moon:'Luna',Mercury:'Mercurio',Venus:'Venus',Mars:'Marte',Jupiter:'Júpiter',Saturn:'Saturno'};
export function planetTheme(planet) { return PLANETS[ALIASES[planet] || planet] || ['observación','Escribe una pregunta sobre tu momento actual.']; }
export function planetReading(hours, target) {
  if(hours.error) return {title:'Lectura no disponible',text:'Revisa la ubicación y el huso horario para calcular este ciclo.'};
  const active=hours.rows.find(row=>target>=row.start && target<row.end);
  const [day]=planetTheme(hours.lord);
  if(!active) return {title:`Día de ${hours.lord}`,text:`El regente del día propone ${day}. La hora elegida queda fuera del tramo mostrado, que comienza al amanecer; no se asigna una hora planetaria a ese instante.`,action:planetTheme(hours.lord)[1]};
  const [theme,action]=planetTheme(active.planet);
  return {title:`A esta hora: ${active.planet}`,text:`A la hora elegida, ${active.planet} pone el foco simbólico en ${theme}, dentro de un día regido por ${hours.lord} (${day}). ${active.planet===hours.lord?'Ambas escalas repiten el mismo tema.':'Puedes combinar el tema del día con una acción pequeña propia de esta franja.'}`,action,question:`¿Cómo puedo hacer espacio para ${theme} en mi actividad actual?`};
}
export function jyotishReading(jyotish) {
  if(jyotish.error) return {title:'Lectura no disponible',text:'No se pudo calcular el ciclo védico con estos datos.'};
  const [long]=planetTheme(jyotish.mahadasha?.lord), [short,action]=planetTheme(jyotish.nakshatra?.lord);
  return {title:'Tu etapa y el foco lunar del momento',text:`El período calculado de ${jyotish.mahadasha?.lord} ofrece un tema de fondo: ${long}. La Luna de la fecha elegida está en ${jyotish.nakshatra?.name}, regida por ${jyotish.nakshatra?.lord}, y añade el foco de ${short}. Puedes mirar cómo dialogan esos temas en tu situación actual.`,action,question:`¿Qué pequeño gesto de ${short} encaja con mi proceso de ${long}?`};
}
const LINE_ACTIONS={1:'Investiga una duda antes de decidir.',2:'Reserva un espacio tranquilo para practicar algo que disfrutas.',3:'Haz una prueba pequeña y anota lo que aprendes.',4:'Comparte una pregunta con alguien de confianza.',5:'Propón una solución concreta y aclara sus límites.',6:'Toma distancia y escribe qué has aprendido de una experiencia.'};
export function hdReading(hd, pd) {
  if(hd.error) return {title:'Lectura no disponible',text:'No se pudo calcular esta aproximación.'};
  return {title:'Una pregunta para aplicar a tu día',text:`La aproximación natal ${hd.profile} combina las líneas ${hd.gatePers.line} y ${hd.gateDes.line}. No es un tránsito diario ni un perfil verificado de Human Design: el mapa actual usa una división simplificada. Como ejercicio personal, puedes cruzarlo con el tema numerológico de ${numberTheme(pd)[0]} de la fecha elegida.`,action:`${LINE_ACTIONS[hd.gatePers.line] || ''} ${LINE_ACTIONS[hd.gateDes.line] || ''}`,question:`¿Cómo podría aplicar ese ejercicio al tema de ${numberTheme(pd)[0]}?`};
}
export function agendaReading(row) {
  const [theme,action]=numberTheme(row.pd);
  return `${theme[0].toUpperCase()+theme.slice(1)}: ${action}`;
}
const SIGN_FOCUS={Aries:['iniciativa','Da un primer paso dejando espacio para escuchar.'],Tauro:['constancia','Sostén una pequeña rutina sin aferrarte a un único resultado.'],Géminis:['curiosidad','Haz una pregunta y escucha la respuesta completa.'],Cáncer:['pertenencia','Cuida un vínculo sin olvidar lo que tú necesitas.'],Leo:['expresión','Comparte algo propio sin exigir aprobación.'],Virgo:['atención al detalle','Mejora una cosa pequeña y permite que sea suficiente.'],Libra:['equilibrio','Expresa tu preferencia además de escuchar la ajena.'],Escorpio:['profundidad','Escribe con honestidad sobre algo que quieras comprender.'],Sagitario:['exploración','Conecta una idea amplia con un paso concreto.'],Capricornio:['perseverancia','Define un objetivo realista y una pausa entre tareas.'],Acuario:['perspectiva','Prueba otra manera de mirar un problema cotidiano.'],Piscis:['imaginación','Da forma a una imagen o emoción mediante palabras o dibujo.']};
export function westernReading(sign,pd) {
  const [focus,action]=SIGN_FOCUS[sign] || ['observación','Anota lo que te llama la atención.'];
  return {title:`Occidental · ${sign}`,text:`Como arquetipo natal, ${sign} abre aquí una reflexión sobre ${focus}. Para la fecha elegida, lo cruzamos con ${numberTheme(pd)[0]} del día personal: piensa cómo expresar ese rasgo en una situación concreta. Es una propuesta editorial entre métodos; el signo natal no cambia y no se calculan tránsitos occidentales.`,action,question:`¿Cómo puedo equilibrar ${focus} con lo que hoy necesito?`};
}
const ANIMAL_FOCUS={Rata:'ingenio',Buey:'constancia',Tigre:'valentía',Conejo:'delicadeza',Dragón:'visión',Serpiente:'observación',Caballo:'autonomía',Cabra:'sensibilidad',Mono:'inventiva',Gallo:'atención',Perro:'lealtad',Cerdo:'generosidad'};
const ELEMENT_FOCUS={Madera:'cultivar un proceso',Fuego:'dar expresión a una idea',Tierra:'crear una base estable',Metal:'distinguir lo esencial',Agua:'escuchar y adaptarte'};
export function chineseReading(chino,pd) {
  const focus=ANIMAL_FOCUS[chino.animal] || 'observación',element=ELEMENT_FOCUS[chino.element] || 'observar el presente';
  return {title:`Chino · ${chino.animal} de ${chino.element}`,text:`La asociación creativa de esta lectura es ${focus}, acompañada de la invitación a ${element}. Al llevarla al tema de ${numberTheme(pd)[0]} del día personal, puedes preguntarte dónde esa combinación te resulta útil. La referencia natal de la app usa el año gregoriano, sin ajustar el año nuevo chino ni calcular una carta completa.`,action:`Elige una situación donde puedas practicar ${focus} sin exagerarla. Después escribe qué cambió en tu manera de abordarla.`,question:`¿Dónde me ayuda ${focus} y dónde necesito otra actitud?`};
}
