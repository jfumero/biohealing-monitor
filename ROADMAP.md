# Roadmap · BioHealing Monitor / Nanorobots HUD

> **Propósito:** plan de ruta corto, concreto y priorizado para evolucionar la experiencia **sin cambiar el espíritu ni la estética** actual. Todo es front-end (estático) a menos que definamos lo contrario.

## Alcance general (Q4 2025)
- Mantener **carácter lúdico/no médico** y ejecución 100% en el navegador.
- Mejorar **usabilidad, accesibilidad, rendimiento** y **portabilidad** de datos de usuario.
- Evitar deuda técnica: documentar, versionar y testear lo esencial.

---

## Hitos (con fechas tentativas)

### M1 — Accesibilidad + Diagnóstico (UX base)
**Ventana:** 2025-10-10 → 2025-10-17  
**Objetivo:** que cualquier usuario entienda y use el HUD sin ayudas externas.

**Entregables**
- Roles ARIA en componentes clave (header, navegación, cards, botones).  
- `aria-live="polite"` para contadores/estado del sistema (LED, ticker).  
- Etiquetas y `aria-describedby` en “Optimizar” y módulos/gauges.  
- Mejoras menores en `diag.html`: versión de build y resultado “copy-to-clipboard”.  

**Criterios de aceptación**
- Navegación por teclado completa (Tab/Shift+Tab) accesible.  
- `diag.html` muestra versión (p. ej. `build: 2025.10.10`).  
- Lighthouse **Accessibility ≥ 90** en desktop.

---

### M2 — Perfil de usuario local (sin backend)
**Ventana:** 2025-10-18 → 2025-10-25  
**Objetivo:** parametrizar datos (nombre, fecha/horario nacimiento) y persistirlos en `localStorage` sin romper el flujo actual.

**Entregables**
- Modal/Panel “Perfil” (Nombre, Fecha/Hora nacimiento, Ubicación opcional).
- Bind de esos datos al HUD (cabecera, edad en vivo, hud astro/bio).  
- Botones “Exportar perfil (JSON)” / “Importar perfil (JSON)”.

**Criterios de aceptación**
- Refresco de la página conserva la configuración.  
- Export/Import funciona con un único archivo `.json` válido.  
- Sin errores en consola y sin bloquear audio/autoplay.

---

### M3 — Modo Performance (controles de carga visual)
**Ventana:** 2025-10-26 → 2025-11-02  
**Objetivo:** mejorar FPS en laptops/ móviles reduciendo densidad gráfica cuando se requiera.

**Entregables**
- Toggle “Performance Mode” con presets: **Alto**, **Medio**, **Bajo**.  
- Parámetros: partículas/s, blur, tamaño, trail y calidad del canvas.  
- Auto-pausa FX cuando la pestaña no está visible (ya implementado, revisar).

**Criterios de aceptación**
- En **Bajo**, FPS estable (≈ 50–60) en hardware medio.  
- Sin degradar legibilidad (contraste y jerarquía intactos).

---

### M4 — Ciclos personales: exportación, calendario y ayuda contextual
**Ventana:** 2025-11-03 → 2025-11-13  
**Objetivo:** portabilidad y comprensión de resultados.

**Entregables**
- Exportar/Importar configuración y calendario de 30 días (`.json`).  
- Tooltip/ayuda breve para cada tarjeta (biorritmos, numerología, etc.).  
- Botón “Hoy” conserva filtros y hace *scroll* al día actual.

**Criterios de aceptación**
- Archivo exportado reinyecta el mismo estado sin inconsistencias.  
- Sin pérdida de datos al cambiar de mes o recargar.  

---

## Métricas de éxito
- **Accesibilidad:** Lighthouse ≥ 90.  
- **Rendimiento:** CPU media < 60% con Performance Mode “Medio”; FPS > 45.  
- **Errores:** 0 errores uncaught en consola durante 5 min de uso.  
- **Portabilidad:** 100% de rehidratación correcta de perfiles exportados.

## Riesgos y mitigación
- **Caché agresiva en Vercel:** usar `?v=YYYYMMDD` o renombrar archivos.  
- **Autoplay bloqueado:** mantener CTA “Comenzar/Sonido” visible y claro.  
- **Dispositivos débiles:** presets de Performance y auto-pausa de FX.

## Release checklist (cada hito)
1. Actualizar `README.md` (cambios y cómo probar).  
2. Asignar `?v=YYYYMMDD` a CSS/JS o renombrar archivos.  
3. Pasar `diag.html` y registrar resultados.  
4. Ejecutar Lighthouse (Accesibilidad y Performance).  
5. Anotar **CHANGELOG**: novedades, fixes y *known issues*.

## Gestión y etiquetas sugeridas
- `feat`, `fix`, `docs`, `perf`, `a11y`, `chore`.  
- `priority:high|medium|low` · `scope:HUD|Ciclos|Diag|Build`.

## Backlog (sin fecha aún)
- Compartir links con perfil embebido (`?profile=` base64/json).  
- Atajos de teclado (mutear, pausar FX).  
- Guardar múltiples perfiles (selector rápido).  
- Modo “Demo” (auto-play de optimizer con guion controlado).  
- i18n (es/en) si conviene mostrar afuera.

---

## Notas
- Este roadmap evita backend. Si más adelante querés multiusuario/sync, considerar **Supabase/Firestore** y auth por magic-link.  
- Mantener **carácter lúdico** y avisos visibles.  
