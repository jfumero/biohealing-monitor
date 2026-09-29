// Original reflective readings; 22 major arcana, upright only.
const entries = [
['El Loco','Un comienzo','Puedes abrir espacio a algo nuevo sin tener todas las respuestas. Curiosidad y prudencia pueden acompañarse.','Prueba un primer paso pequeño y reversible.','¿Qué me gustaría explorar?','☀'],
['El Mago','Tus recursos','La invitación es reconocer lo que ya tienes y darle una dirección concreta. No necesitas hacerlo todo a la vez.','Elige una herramienta o habilidad y úsala en un pendiente.','¿Qué recurso estoy pasando por alto?','✧'],
['La Sacerdotisa','Escuchar','Antes de responder, deja espacio para observar. Una impresión puede ser un punto de partida para preguntar, no una certeza.','Escribe lo que sientes y qué te falta saber.','¿Qué descubro cuando no me apuro?','☾'],
['La Emperatriz','Cultivar','Algo valioso puede crecer con atención cotidiana. Cuidar también incluye dejar espacio y respetar los tiempos.','Dedica un gesto concreto a un proyecto o vínculo.','¿Qué quiero nutrir?','❋'],
['El Emperador','Dar estructura','Una base clara puede ayudarte a avanzar. La estructura funciona mejor cuando sostiene, sin volverse rigidez.','Define un límite y un paso realizable.','¿Qué orden me daría más libertad?','◇'],
['El Hierofante','Aprender','Mira las ideas que te orientan y elige cuáles siguen teniendo sentido para ti. Puedes aprender de otros conservando tu criterio.','Revisa una costumbre y el motivo por el que la mantienes.','¿Qué enseñanza quiero conservar?','✦'],
['Los Enamorados','Elegir con coherencia','Esta carta invita a mirar tus valores y tus vínculos al decidir. No exige una elección perfecta, sino una elección consciente.','Anota qué valor quieres respetar en una decisión.','¿Qué elección se parece más a lo que valoro?','♡'],
['El Carro','Orientar el impulso','Puedes reunir tus esfuerzos alrededor de una dirección. Avanzar no significa forzar lo que necesita otro ritmo.','Elige una prioridad y aparta una distracción.','¿Hacia dónde quiero dirigir mi atención?','➶'],
['La Fuerza','Firmeza amable','La paciencia también es una forma de fuerza. Puedes sostener una intención sin tratarte con dureza.','Aborda una tarea difícil en una porción pequeña.','¿Cómo sería ser firme y amable conmigo?','∞'],
['El Ermitaño','Encontrar perspectiva','Un momento de silencio puede ayudarte a distinguir tu voz del ruido. La pausa puede convivir con pedir compañía.','Reserva unos minutos para escribir a solas.','¿Qué necesito escuchar de mí?','✴'],
['La Rueda de la Fortuna','Aceptar el movimiento','Las circunstancias cambian y no todo depende de ti. Puedes distinguir lo que está en tus manos de lo que requiere adaptación.','Separa un pendiente en lo que puedes hacer y lo que debes esperar.','¿Dónde puedo adaptarme?','☸'],
['La Justicia','Mirar con claridad','La invitación es revisar hechos, acuerdos y consecuencias con equilibrio. Ser justo también incluye reconocer tus límites.','Revisa un compromiso y aclara lo que puedes cumplir.','¿Qué sería una respuesta proporcionada?','⚖'],
['El Colgado','Otra perspectiva','Una pausa puede mostrar una alternativa que la prisa oculta. No todo estancamiento necesita más esfuerzo.','Describe un asunto desde otro punto de vista.','¿Qué cambia si dejo de empujar por un momento?','⟡'],
['La Muerte','Cerrar una etapa','Aquí representa transformación y cierre, no una muerte literal. Algo puede terminar para que cambie tu manera de relacionarte con ello.','Despídete por escrito de un hábito que quieras revisar.','¿Qué estoy listo para dejar atrás?','❧'],
['La Templanza','Encontrar medida','Puedes integrar necesidades distintas sin irte a los extremos. Lo sostenible suele construirse con ajustes pequeños.','Combina una actividad con una pausa que te resulte agradable.','¿Qué necesita una medida más amable?','≈'],
['El Diablo','Reconocer ataduras','Observa lo que sientes que tienes que hacer y cuánto margen de elección existe. La carta no señala una amenaza: invita a recuperar perspectiva.','Identifica una exigencia y cuestiona si realmente es tuya.','¿Dónde quiero recuperar libertad?','⌘'],
['La Torre','Revisar una base','Esta imagen invita a mirar una idea que quizá ya no te sostiene. No anuncia una desgracia; propone revisar y reconstruir con calma.','Reconsidera una suposición pequeña antes de actuar.','¿Qué puedo construir de una forma más honesta?','ϟ'],
['La Estrella','Dar lugar a la esperanza','Puedes reconocer algo que te inspira sin exigir garantías. Un gesto sencillo puede acercarte a lo que deseas cultivar.','Anota algo que agradeces y un paso que te ilusiona.','¿Qué me ayuda a recuperar perspectiva?','☆'],
['La Luna','Habitar la incertidumbre','No tener claridad todavía no obliga a llenar los vacíos con conclusiones. Distingue hechos, emociones y posibilidades.','Escribe lo que sabes y lo que estás suponiendo.','¿Qué necesito aclarar antes de decidir?','☽'],
['El Sol','Reconocer lo bueno','Date permiso para disfrutar algo sencillo y reconocer lo que ya has hecho. La alegría no necesita borrar las dificultades.','Celebra un avance pequeño de manera concreta.','¿Qué merece hoy mi reconocimiento?','☀'],
['El Juicio','Revisar y renovar','Puedes mirar una experiencia pasada para elegir de otra manera, sin convertirla en una condena sobre ti.','Escribe un aprendizaje y cómo quieres aplicarlo.','¿Qué respuesta nueva puedo dar?','✺'],
['El Mundo','Integrar','Una etapa puede dejar aprendizajes que vale la pena reconocer. Completar también es detenerse a valorar el camino recorrido.','Haz un breve balance de algo que has terminado.','¿Qué quiero llevar conmigo a la próxima etapa?','◎']
];
export const TAROT = entries.map(([name,theme,text,action,question,symbol],id)=>({id,name,theme,text,action,question,symbol}));
export function drawCard(cryptoSource = globalThis.crypto) {
  // Rejection sampling preserves equal chances for all 22 cards.
  const limit = Math.floor(4294967296 / TAROT.length) * TAROT.length;
  const values = new Uint32Array(1);
  do { cryptoSource.getRandomValues(values); } while(values[0] >= limit);
  return TAROT[values[0] % TAROT.length];
}
