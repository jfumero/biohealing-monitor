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
- Escena de nanorobots: entrada en el mapa corporal, recorrido, foco por zonas y regreso a una constelación central.
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

Verificados: compilación de producción, conservación de perfiles, manejo de almacenamiento inválido, coherencia de biorritmos, secuencia de sesión y generación de las pantallas del monitor y ciclos.

Pendiente: revisión visual en navegador a 1440, 768 y 390 px, teclado, audio e interacciones completas. El navegador de la sesión de desarrollo bloqueó el acceso por no poder verificar una política de seguridad; las pruebas de renderizado no sustituyen esa comprobación.

Licencia: MIT, según la documentación original.
