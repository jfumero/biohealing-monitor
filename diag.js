(function () {
  const $ = (id) => document.getElementById(id);
  const list = $("diag-list");
  const kv = $("kv");

  function li(text, cls = "ok") {
    const el = document.createElement("li");
    el.className = cls;
    el.textContent = text;
    list.appendChild(el);
  }

  function row(k, v) {
    const dk = document.createElement("div");
    dk.className = "k";
    dk.textContent = k;
    const dv = document.createElement("div");
    dv.className = "v";
    dv.textContent = v;
    kv.appendChild(dk);
    kv.appendChild(dv);
  }

  // --- 1) Assets estáticos y páginas directas ---
  const checkHead = (url, okTxt, errTxt, warn = false) =>
    fetch(url, { method: "HEAD", cache: "no-cache" })
      .then(r => li(`${okTxt} (HTTP ${r.status})`, r.ok ? "ok" : (warn ? "warn" : "err")))
      .catch(() => li(errTxt, warn ? "warn" : "err"));

  checkHead("style.css?v=1", "style.css accesible", "style.css no accesible");
  checkHead("main.js?v=1", "main.js accesible", "main.js no accesible");
  checkHead("music.mp3", "music.mp3 accesible", "music.mp3 no accesible (opcional)", true);

  // Estas dos validan que vercel.json no reescriba todo a index.html
  checkHead("ciclos.html", "ciclos.html accesible directamente", "ciclos.html no accesible: revisar vercel.json");
  checkHead("diag.html", "diag.html accesible directamente", "diag.html no accesible: revisar vercel.json");

  // --- 2) APIs del navegador ---
  // WebAudio
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      li("WebAudio: no soportado", "warn");
    } else {
      const ctx = new AudioCtx();
      li(`WebAudio: soportado (state=${ctx.state})`, "ok");
      ctx.close();
    }
  } catch (e) {
    li("WebAudio: error al inicializar", "warn");
  }

  // WebGL
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
    li(`WebGL: ${gl ? "disponible" : "no disponible"}`, gl ? "ok" : "warn");
  } catch {
    li("WebGL: error al crear contexto", "warn");
  }

  // localStorage
  try {
    localStorage.setItem("__bhm_test", "1");
    localStorage.removeItem("__bhm_test");
    li("localStorage: disponible", "ok");
  } catch {
    li("localStorage: bloqueado o sin permiso", "warn");
  }

  // Service Worker (si en un futuro lo agregás)
  if ("serviceWorker" in navigator) {
    li("Service Worker: soportado (no registrado por este proyecto)", "ok");
  } else {
    li("Service Worker: no soportado (opcional)", "warn");
  }

  // --- 3) Entorno / metadatos útiles ---
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "desconocida";
    row("Zona horaria", tz);
  } catch { row("Zona horaria", "no disponible"); }

  row("UserAgent", navigator.userAgent || "desconocido");
  row("Idioma", navigator.language || "desconocido");
  row("Plataforma", navigator.platform || "desconocida");
  row("Online", navigator.onLine ? "sí" : "no");

  // Dimensiones
  row("Viewport", `${window.innerWidth} x ${window.innerHeight}`);
  row("Pixel Ratio", (window.devicePixelRatio || 1).toString());

  // Memoria aproximada (no estándar en todos los navegadores)
  if ("deviceMemory" in navigator) {
    row("Memoria del dispositivo (GB)", navigator.deviceMemory.toString());
  }

  // --- 4) Prueba de fetch GET a index (para detectar rewrites raros) ---
  fetch("index.html", { cache: "no-cache" })
    .then(r => li(`GET index.html (HTTP ${r.status})`, r.ok ? "ok" : "warn"))
    .catch(() => li("GET index.html: error", "warn"));

})();
