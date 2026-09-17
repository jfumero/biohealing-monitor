import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

test('both application entries render meaningful content with valid SVG gauges and retained calculations', async () => {
  const server=await createServer({server:{middlewareMode:true,watch:null,ws:false},appType:'custom'});
  try {
    const monitor=await server.ssrLoadModule('/src/main.jsx');
    const html=renderToString(React.createElement(monitor.App));
    assert.match(html,/Iniciar sesión/);
    assert.equal((html.match(/role="meter"/g)||[]).length,8);
    assert.ok(!html.includes('MPH'));
    assert.match(html,/Presión arterial/);
    const cycles=await server.ssrLoadModule('/src/cycles.jsx');
    const page=renderToString(React.createElement(cycles.App));
    for(const label of ['Numerología','Horas planetarias','Jyotish','Human Design','Próximos 30 días']) assert.ok(page.includes(label),label);
    assert.ok(!page.includes('NaN'));
    assert.ok(!page.includes('is not a function'));
  } finally { await server.close(); }
});
