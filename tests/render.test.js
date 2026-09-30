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
    assert.match(html,/Tu reloj de vida/);
    assert.match(html,/Desde la concepción/);
    assert.match(html,/segundos/);
    assert.equal((html.match(/role="meter"/g)||[]).length,8);
    assert.ok(!html.includes('MPH'));
    assert.match(html,/Presión arterial/);
    assert.match(html,/Desplegar nanorobots/);
    assert.match(html,/Acerca de BioHealing/);
    assert.match(html,/Mapa corporal del recorrido de nanorobots/);
    const nano=await server.ssrLoadModule('/src/NanobotScene.jsx');
    const renderScene=(status,elapsed,quiet=false)=>renderToString(React.createElement(nano.default,{
      session:{status,elapsed},quiet,target:'chest',onTarget:()=>{},onStart:()=>{},onPause:()=>{},onFinish:()=>{}
    }));
    const running=renderScene('running',35);
    assert.match(running,/Pausar recorrido/);
    assert.match(running,/Transparencia del cuerpo/);
    assert.match(running,/class="anatomical-body"/);
    assert.match(running,/class="vascular-layer"/);
    const ids=new Set([...running.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
    for(const reference of running.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.has(reference[1]),reference[1]);
    assert.equal((running.match(/class="nano-particle"/g)||[]).length,56);
    assert.equal((renderScene('running',35,true).match(/class="nano-particle"/g)||[]).length,14);
    assert.match(renderScene('paused',35),/Continuar recorrido/);
    assert.match(renderScene('complete',60),/Vigilancia distribuida/);
    assert.ok(!running.includes('NaN'));
    const cycles=await server.ssrLoadModule('/src/cycles.jsx');
    const page=renderToString(React.createElement(cycles.App));
    const day=renderToString(React.createElement(cycles.App,{mode:'day'}));
    for(const label of ['Buen día, Jonathan','Tu reloj de vida','Tu carta de hoy','Tus ciclos, de un vistazo','Conversar sobre mi lectura','Ver lectura completa','Ver detalle','Mi perfil','Ajustes']) assert.ok(day.replace(/<!--.*?-->/g,'').includes(label),label);
    for(const link of ['/visualizacion.html','/ciclos.html','/#carta','/#conversar']) assert.ok(day.includes(`href="${link}"`),link);
    assert.ok(!day.includes('NaN'));
    const allIds=[...day.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(new Set(allIds).size,allIds.length,'dashboard IDs must be unique');
    assert.equal((day.match(/class="day-ring"/g)||[]).length,3);

    for(const label of ['Numerología','Horas planetarias','Jyotish','Human Design','Próximos 30 días']) assert.ok(page.includes(label),label);
    assert.match(page,/Tu lectura del momento/);
    assert.match(page,/Tu resumen general/);
    assert.match(page,/Leer con DeepSeek/);
    assert.match(page,/Conversar sobre mi lectura/);
    assert.match(page,/Enviar pregunta/);
    assert.match(page,/Tu pregunta/);
    assert.match(page,/Sacar una carta/);
    assert.match(page,/22 arcanos mayores/);
    assert.match(page,/Para llevarlo a tu día/);
    assert.match(page,/Propuesta para el día/);
    assert.match(page,/00:49/);
    assert.ok(!page.includes('NaN'));
    assert.ok(!page.includes('is not a function'));
  } finally { await server.close(); }
});
