# BioHealing Monitor · Nanorobots HUD (lúdico)

Experiencia futurista tipo “monitor biomédico” que simula nanorobots en el torrente sanguíneo, con módulos de optimización y una app de “Ciclos personales” (biorritmos, numerología, horas planetarias, etc.). **Carácter lúdico / no médico.**

## Demo
- Producción (Vercel): `https://<tu-proyecto>.vercel.app`
- Páginas:
  - `/` → Monitor principal (HUD)
  - `/ciclos.html` → App de ciclos personales
  - `/diag.html` → Diagnóstico de despliegue/navegador

## Estructura
```
/index.html     # HUD principal
/style.css      # Estilos (tema oscuro futurista)
/main.js        # Lógica HUD, audio, FX, optimizer
/ciclos.html    # App de ciclos (single-file React)
/diag.html      # Página de diagnóstico
/diag.js        # Tests de assets/APIs navegador
/music.mp3      # Música opcional (loop)
/vercel.json    # Rewrites/headers de caché
```

## Cómo correr localmente
1. Clonar repo.
2. Servir archivos estáticos (evitar abrir HTML directo por CORS):
   - Con Node: `npx http-server -p 5173` (o `npx serve .`)
   - O cualquier servidor estático.
3. Abrir `http://localhost:5173/`.

> **Audio:** navegadores bloquean autoplay. Hacé clic en **Comenzar** / **Sonido** para habilitar.

## Deploy (Vercel)
- Importar repo → Framework: **Other** (estático).
- Build Command: (vacío) · Output: `/`.
- Rewrites en `vercel.json` ya permiten:
  - Acceso directo a `/ciclos.html` y `/diag.html`.
  - SPA fallback a `index.html` para rutas desconocidas.
- **Caché:** CSS/JS con `max-age=31536000`. Usar `?v=YYYYMMDD` o renombrar archivos para **cache-busting** al publicar cambios.

## Funcionalidades
- **HUD principal:** canvas con “sangre” y nanobots, módulos con gauges (glucosa, presión, etc.), optimizer visual con cola de tareas.
- **Audio:** hum + música opcional (WebAudio).
- **Ciclos personales:** biorritmos, numerología, chino, maya, horas planetarias, jyotish básico, Human Design básico, calendario 30 días.
- **Diagnóstico:** chequeo de assets, WebAudio, WebGL, localStorage, Service Worker (soporte), y metadatos del cliente.

## Privacidad y datos
- Sin backend: todo corre en el navegador.
- Preferencias guardadas en `localStorage`.
- **Disclaimer:** Esto es una experiencia lúdica, no reemplaza diagnóstico ni tratamiento médico.

## Compatibilidad
- Navegadores modernos (Chrome/Edge/Firefox). Requiere WebGL y WebAudio para la experiencia completa.
- Móvil: funciona, pero se recomienda desktop para mejor rendimiento visual.

## Problemas comunes (y solución)
- **No se escucha audio:** el navegador bloquea autoplay → hacer clic en **Comenzar** y luego **Sonido ON**.
- **Canvas lento:** cerrar pestañas pesadas; bajar resolución de pantalla; desactivar ahorro de energía.
- **Cambios no se ven en producción:** limpiar caché o publicar con `?v=...`/renombrar archivos (caché larga de Vercel).
- **Rutas directas 404:** usar URLs exactas (`/ciclos.html`, `/diag.html`) o entrar por `/` (SPA fallback).

## Roadmap sugerido
- Accesibilidad: `aria-live` en contadores, roles completos para gauges.
- Parámetros de usuario: permitir setear nombre/fecha desde UI (perfil).
- Modo performance: opción para bajar densidad de partículas/FX.
- Exportar/Importar perfiles de “Ciclos” (JSON) y compartir enlaces.
- Tests básicos (Smoke/E2E) y checklist de release.

## Licencia
MIT (o la que elijas).
