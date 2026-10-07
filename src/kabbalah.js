export const SEFIROT=[
 {name:'Kéter',quality:'Intención',text:'Dale un sentido sencillo a lo que querés hacer.',action:'Escribí una intención para hoy, sin exigir un resultado.',phrase:'Puedo elegir hacia dónde dar mi próximo paso.'},
 {name:'Jojmá',quality:'Sabiduría',text:'Hacé espacio para una idea antes de juzgarla.',action:'Anotá una idea y dejá su evaluación para después.',phrase:'Puedo escuchar una idea sin resolverla enseguida.'},
 {name:'Biná',quality:'Comprensión',text:'Detenete a ordenar lo que todavía no entendés.',action:'Separá en dos líneas lo que sabés y lo que necesitás preguntar.',phrase:'Comprender lleva tiempo; puedo darme ese tiempo.'},
 {name:'Jésed',quality:'Generosidad',text:'Explorá cómo dar sin olvidarte de tus necesidades.',action:'Elegí un gesto amable que esté dentro de tus posibilidades.',phrase:'Puedo ser generoso sin dejarme de lado.'},
 {name:'Guevurá',quality:'Límites',text:'Un límite claro puede cuidar un vínculo.',action:'Identificá algo a lo que necesitás decir «hoy no puedo».',phrase:'Puedo poner límites y seguir siendo amable.'},
 {name:'Tiféret',quality:'Equilibrio',text:'Buscá un punto de encuentro entre cuidado y firmeza.',action:'Pensá cómo expresar una necesidad con claridad y respeto.',phrase:'Puedo cuidar lo que siento y cómo lo expreso.'},
 {name:'Nétzaj',quality:'Perseverancia',text:'La continuidad puede construirse con pasos pequeños.',action:'Dedicá cinco minutos a algo que querés sostener.',phrase:'Un paso pequeño también cuenta.'},
 {name:'Hod',quality:'Claridad',text:'Poné en palabras lo que querés transmitir.',action:'Reescribí un mensaje importante de forma sencilla.',phrase:'Puedo hablar con claridad y escuchar con atención.'},
 {name:'Yesod',quality:'Conexión',text:'Observá qué sostiene tus hábitos y relaciones.',action:'Elegí un hábito pequeño que te ayude a sentir continuidad.',phrase:'Puedo construir una base con gestos cotidianos.'},
 {name:'Maljut',quality:'Acción',text:'Llevá una intención a un gesto posible en tu entorno.',action:'Hacé una tarea concreta de menos de diez minutos.',phrase:'Puedo llevar una intención a la práctica.'}
];
export function kabbalahForDay(day){
 const stamp=Date.parse(`${day}T00:00:00Z`);
 if(!Number.isFinite(stamp))throw Error('Fecha inválida');
 const index=((Math.floor(stamp/86400000)%10)+10)%10;
 return {...SEFIROT[index],index,method:'Recorrido editorial de diez cualidades, una por día; no es un cálculo cabalístico tradicional ni una asignación por nacimiento.'};
}
