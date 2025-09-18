// 1) ¿Aplicó CSS? Probamos un estilo computado del body.
(function(){
  const cssEl = document.getElementById('css-ok');
  const bg = getComputedStyle(document.body).backgroundImage;
  cssEl.textContent = (bg && bg !== 'none') ? '✔️ Sí' : '❌ No';
})();

// 2) ¿Este JS cargó?
document.getElementById('js-ok').textContent = '✔️ Sí';

// 3) ¿El archivo CSS existe en el server?
fetch('/css/style.css?v=4', {cache:'no-store'})
  .then(r => document.getElementById('fetch-ok').textContent = r.ok ? '✔️ 200 OK' : ('❌ ' + r.status))
  .catch(e => document.getElementById('fetch-ok').textContent = '❌ Error de red');
