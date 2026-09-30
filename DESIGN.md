# Diseño aprobado: Mi día

La portada reúne el reloj de vida compacto, lectura principal, tarot, tres indicadores de ciclos y acceso a visualización. La lectura completa y la conversación se abren en un diálogo nativo que conserva su estado al cerrarse. La carta mantiene sus resultados durante la visita. El menú lateral dispone de Mi día, Mis ciclos, Mi carta, Visualización, Conversar, Mi perfil y Ajustes. En móvil se convierte en un menú desplegable. Los métodos completos se expanden individualmente y tienen accesos directos.

Se conservan los cálculos, la configuración, el cumpleaños, el reloj prenatal, la API DeepSeek y las sesiones de visualización. La antigua portada de monitor ahora está en `/visualizacion.html`. `index.html` y `ciclos.html` usan el mismo componente de cálculos para evitar resultados distintos.

## Imagen

Herramienta: generación integrada de imágenes (imagegen), no CLI. Imagen generada conservada y convertida a WebP para la web, sin recorte ni alteración de contenido.

Archivo del proyecto: `public/images/forest-sanctuary.webp`.

Prompt final:

> Create a production website background asset, no text, no interface, no borders. Wide landscape cinematic painterly photographic forest sanctuary matching an elegant dark petroleum navy and mint green web app. A calm shallow river with a path of broad flat stepping stones leading diagonally from lower right foreground to middle right distance. Dense evergreen trees and misty layered mountains at twilight, a very subtle pale mint moon reflected on water upper right. Left 55 percent predominantly dark soft shadowed forest and quiet negative space to overlay white text with strong legibility. Overall palette strictly deep petroleum #031620, dark forest #0b2826, muted emerald teal foliage, restrained pale mint atmospheric light. Extremely calm, organic, premium editorial nature image. Fine realistic details in moss, stones, gentle reflections. No people, no buildings, no logos, no lettering, no orange sunset, no saturated blue or purple. Landscape 1536x1024 or wider. This will be used as a background under gradient overlays on desktop and mobile cards.

La ilustración de fondo es decorativa. Los textos, relojes, botones y datos son elementos web reales; no se utiliza la maqueta como una imagen de la interfaz.

## Verificación

Pruebas de renderizado para las tres entradas y compilación de producción correctas. Verificación interactiva en escritorio y móvil de 390 px: portada, sorteo de carta, apertura y cierre de conversación con foco en la pregunta, menú móvil, acceso a ciclos, expansión de numerología y visualización. Sin errores de consola en esos recorridos ni desbordamiento horizontal en portada y ciclos. El bloqueo temporal inicial del navegador se resolvió. No se repitieron llamadas de pago a DeepSeek ni pruebas de audio en este cambio visual.
