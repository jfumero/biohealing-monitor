# BioHealing Monitor

Web personal en React + Vite, con instrumentos SVG inspirados en relojes turquesa sobre azul petróleo. La experiencia es lúdica: los porcentajes representan el avance de una simulación, no mediciones ni tratamientos médicos.

## Desarrollo

Requiere Node.js 22.12 o superior.

```sh
npm ci
npm run dev
```

Abrir la dirección indicada por Vite. Las páginas son `/`, `/ciclos.html` y `/diag.html`.

```sh
npm test
npm run build
npm run preview
```

## Publicación

`vercel.json` configura Vite, `npm run build` y la carpeta `dist`. También se puede servir `dist` en cualquier alojamiento estático. No se requiere un servidor de aplicaciones. Los recursos compilados tienen nombres versionados; las páginas HTML no reciben caché de un año.

## Funciones

- Sesión de 60 segundos con pausa, continuación, cancelación y resumen final.
- Un reloj general y siete módulos individuales, con escalas de 0 a 100.
- Escena de nanorobots: entrada única por el antebrazo, recorrido vascular, foco por zonas y vigilancia distribuida al terminar.
- Figura anatómica vectorial verde con musculatura, control de transparencia y red vascular que aparece gradualmente.
- Vista celular animada y selección de cabeza, tórax, abdomen, brazos, piernas o cuerpo completo.
- Pausa compartida entre sesión, enjambre y vista celular; modo tranquilo con menos partículas y cambios por etapa.
- Información sobre la naturaleza de la experiencia disponible en «Acerca de BioHealing», sin avisos repetidos en el monitor.
- Música opcional, apagada inicialmente; se pausa al ocultar la pestaña.
- Modo tranquilo y respeto de la preferencia del sistema de movimiento reducido.
- Perfil compartido, biorritmos, numerología, runas, horas planetarias, Jyotish aproximado, Human Design básico y tabla de 30 días.
- Navegación compartida y diseño adaptable al móvil.
- Saludo de cumpleaños discreto en el monitor.

## Código

- `src/main.jsx`: monitor, sesión y módulos.
- `src/Gauge.jsx`: instrumento SVG reutilizable.
- `src/NanobotScene.jsx` y `src/nanobots.js`: escena corporal, etapas y trayectorias deterministas del enjambre.
- `src/AnatomicalBody.jsx`: ilustración anatómica y vasos con las mismas curvas que recorren las partículas.
- `src/Shell.jsx`: navegación común.
- `src/profile.js`: validación, almacenamiento y cálculos diarios compartidos.
- `src/session.js`: estados y duración de la sesión.
- `src/cycles.jsx`: interfaz de ciclos.
- `src/cycle-calculations.js`: cálculos originales de ciclos, separados de la interfaz.
- `src/theme.css`: diseño común y adaptaciones de pantalla.
- `tests/`: pruebas del perfil, sesión y renderizado sin navegador.

## Migración y datos

Se conserva la clave `cycles_app_state` de localStorage. Los perfiles existentes se leen sin volver a introducir los datos siempre que se visite desde el mismo navegador y dominio. Una URL de vista previa tiene su propio almacenamiento, por lo que no recibe automáticamente el perfil de producción. No hay cuentas ni sincronización entre dispositivos.

Los cálculos simbólicos conservan las aproximaciones de la versión anterior. Se unificó el cómputo diario de biorritmos y se corrigieron los límites del zodiaco occidental. La fecha de lectura comienza en el día actual; el usuario puede elegir otra fecha. Los scripts anteriores fueron reemplazados y su historial sigue disponible en Git.

## Validación de esta versión

La figura es una ilustración estilizada en SVG, no una reproducción fotográfica ni un modelo anatómico clínico. La generación de un recurso raster fue bloqueada por el generador de imágenes; se amplió el recurso vectorial nativo. Se inspeccionó una representación estática de la ilustración.

Verificados: compilación de producción, conservación de perfiles, manejo de almacenamiento inválido, coherencia de biorritmos, secuencia de sesión y generación de las pantallas del monitor y ciclos.

Pendiente: revisión visual en navegador a 1440, 768 y 390 px, teclado, audio e interacciones completas. El navegador de la sesión de desarrollo bloqueó el acceso por no poder verificar una política de seguridad; las pruebas de renderizado no sustituyen esa comprobación.

Licencia: MIT, según la documentación original.

### Reloj de vida

Cuenta calendario hasta segundos, con huso fijo al nacer configurable en el perfil y segundos de nacimiento asumidos como 00. El reloj depende de los datos introducidos y de la hora del dispositivo. Los meses se ajustan al último día disponible; el cumpleaños del 29 de febrero se celebra el 28 en años no bisiestos. Los globos aparecen una vez por cumpleaños y sesión del navegador, permiten repetir la celebración y respetan el movimiento reducido.

La edad prenatal se muestra hasta días y siempre como estimación: fecha manual o nacimiento menos 266 días. No reconstruye una concepción real. Referencia: [ACOG, métodos para estimar la fecha de parto](https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date) (280 días desde la última menstruación y ovulación supuesta al día 14). No es el [conteo coreano tradicional](https://www.korea.net/NewsFocus/policies/view?articleId=234677).

Verificación: pruebas de calendario, husos, cumpleaños, persistencia y renderizado; compilación de producción. La comprobación visual interactiva continúa limitada por la política del navegador disponible en este entorno.

### Lecturas del momento

Las tarjetas muestran interpretaciones editoriales visibles, con un foco, una acción y una pregunta. Se actualizan al cambiar fecha/hora, con botón Ahora en el huso configurado. Cubren biorritmos, numerología (incluidos números natales), sello/tono, runas, referencia occidental/china, horas planetarias, Jyotish, aproximación de Human Design y agenda de 30 días. Los cruces de signos natales con numerología se identifican como propuestas editoriales, no tránsitos. La referencia china mantiene su cálculo por año gregoriano.

La hora predeterminada se corrige a 00:49 y se migra el antiguo perfil de Jonathan con 00:43 una sola vez. Se conservan otros perfiles y posteriores ediciones. Los cálculos astronómicos usan el instante de nacimiento con su huso fijo; los ciclos de fecha conservan el calendario civil.

Las asociaciones sirven para reflexión, no como predicciones ni mediciones de salud. El HD existente usa división uniforme y no sustituye un BodyGraph: [fuente del sistema](https://jovianarchive.com/pages/get-your-human-design-chart). Contexto de simbolismo zodiacal: [Astrodienst](https://www.astro.com/astrology/in_elements_e.htm). Las propuestas diarias son textos propios.

Verificación: pruebas de variación de lecturas, intervalos horarios, migración, persistencia y renderizado, más compilación de producción. No se ha verificado la interacción visual en navegador.

### Síntesis general y tarot

El resumen reúne los nueve métodos presentes en una lectura editorial por reglas, sin servicios externos ni IA. Detecta coincidencias planetarias, contrasta las curvas y propone una acción del día; el desplegable muestra la contribución de cada método y las limitaciones de las aproximaciones. Cambia con los datos y el momento consultado.

Tarot: 22 arcanos mayores al derecho, textos originales, sorteo uniforme con Web Crypto y rechazo de la cola sesgada. Cada pulsación es independiente y puede repetir carta. La carta y el momento consultado permanecen en memoria hasta otro sorteo o salir de la página. No se envían datos ni se requiere una clave API. Pruebas de cobertura de cartas, rechazo, repetición, síntesis, errores parciales y renderizado; compilación de producción. Verificación visual interactiva pendiente.

### DeepSeek (resumen y tarot)

`POST /api/reading` ejecuta la consulta en una función de Vercel. Requiere `DEEPSEEK_API_KEY` solo en el entorno del servidor (Production); nunca usar prefijo VITE ni incluir la clave en archivos versionados. Modelo `deepseek-flash`, pensamiento desactivado, máximo 1200 tokens y timeout de 45 segundos. Referencia: https://api-docs.deepseek.com/api/create-chat-completion/ .

El botón «Leer con DeepSeek» es manual: no hay consultas al cargar, cambiar fecha o sacar carta. Envía momento consultado, resultados de los métodos y, para tarot, el identificador de la carta; excluye nombre, nacimiento y coordenadas. El servidor valida y limita la carga, reconstruye la carta y mantiene instrucciones fijas. La respuesta se presenta como texto escapado por React. Si falla, se mantiene la lectura base (o la última lectura generada). Cambiar el contexto del resumen o volver a sortear cancela solicitudes anteriores y descarta sus textos. La carta conserva el contexto del sorteo.

El endpoint es público: exige origen de producción o del despliegue y limita a seis consultas/minuto por IP por instancia. Estas barreras no son autenticación ni un límite global de gasto; los contadores se reinician al escalar. Para acceso exclusivamente privado o un presupuesto global estricto, se necesita autenticación y límites persistentes/WAF. No se registran claves, datos ni textos en logs del código. Las lecturas se conservan solo mientras el componente esté abierto. El servidor no persiste resultados.

Pruebas: validación, datos excluidos, errores de proveedor y saldo, timeout, respuesta incompleta, límites y renderizado. `npm run dev` solo sirve Vite; el endpoint requiere Vercel o `vercel dev` con el secreto configurado.

### Preguntas sobre las lecturas

El desplegable «Conversar sobre mi lectura» (o «Conversar sobre esta carta») permite enviar una pregunta de hasta 1000 caracteres. Incluye los resultados del momento, la lectura generada si existe y las dos últimas parejas pregunta/respuesta. El historial visible dura mientras el componente está abierto, sin persistencia en el navegador ni en el servidor. Se puede empezar una nueva conversación. Cada envío usa la API; no hay peticiones automáticas.

Cambiar contexto o regenerar la lectura cancela la petición pendiente y reinicia el diálogo. En el tarot se usa el momento guardado al sortear. En caso de error, el texto de la pregunta se conserva para reintentar. El servidor valida roles alternados, número de mensajes y tamaños; no acepta mensajes system aportados por el cliente. La instrucción de conversación distingue la lectura simbólica de un diagnóstico y no infiere salud a partir de los ciclos.

Pruebas: formato y límite de historial, rechazo de roles inyectados, contexto de carta y lectura, envío al proveedor simulado y renderizado accesible.

### Nueva portada y navegación

`/` muestra Mi día: reloj compacto expandible, acceso a lectura y conversación en diálogo, tarot con interpretación desplegable, indicadores de ciclos y acceso al recorrido. `/visualizacion.html` conserva el monitor completo. `/ciclos.html` mantiene todos los métodos y la configuración; cada método despliega su contenido y dispone de enlace directo. El menú lateral enlaza las secciones y se pliega con un botón accesible en pantallas pequeñas.

La portada usa exactamente los cálculos del módulo de ciclos, sin duplicar fórmulas. Abrir diálogos o menús no consulta DeepSeek: solo los botones de generación y envío. Se conserva la carta al cerrar la interpretación y la conversación al cerrar el diálogo. El reloj completo y los globos de cumpleaños siguen disponibles. Detalles del diseño y procedencia del fondo en DESIGN.md.
