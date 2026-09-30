import test from 'node:test';
import assert from 'node:assert/strict';
import { handler } from '../api/deepseek-summary.js';

function makeResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    end(value) { this.body = JSON.parse(value); },
  };
}

test('requires POST and returns JSON without contacting DeepSeek', async () => {
  const res = makeResponse();
  await handler({ method: 'GET' }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, 'POST');
  assert.equal(res.body.error, 'Método no permitido.');
});

test('rejects browser requests from another origin', async () => {
  const res = makeResponse();
  await handler({ method: 'POST', headers: { origin: 'https://attacker.example', host: 'biohealing.example' } }, res);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error, 'Origen no permitido.');
});

test('validates source readings before sending the request', async () => {
  const res = makeResponse();
  const previous = process.env.DEEPSEEK_API_KEY;
  process.env.DEEPSEEK_API_KEY = 'test-key';
  const fetchBefore = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('fetch should not run'); };
  try {
    await handler({ method: 'POST', body: { sources: [] } }, res);
    assert.equal(res.statusCode, 400);
  } finally {
    globalThis.fetch = fetchBefore;
    if (previous === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = previous;
  }
});

test('sends bounded reading text server-side and returns validated JSON fields', async () => {
  const res = makeResponse();
  const previousKey = process.env.DEEPSEEK_API_KEY;
  const previousModel = process.env.DEEPSEEK_MODEL;
  process.env.DEEPSEEK_API_KEY = 'test-key';
  process.env.DEEPSEEK_MODEL = 'deepseek-flash';
  const fetchBefore = globalThis.fetch;
  let sent;
  globalThis.fetch = async (url, options) => {
    sent = { url, options, body: JSON.parse(options.body) };
    return {
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify({
        title: 'Una pausa consciente',
        paragraphs: ['Un primer párrafo.', 'Un segundo párrafo.'],
        action: 'Elegí un paso pequeño.',
        question: '¿Qué te gustaría observar?',
      }) } }] }),
    };
  };
  try {
    await handler({ method: 'POST', body: { sources: [{ name: 'Numerología', text: 'Día personal 4.' }] } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(sent.url, 'https://api.deepseek.com/chat/completions');
    assert.equal(sent.options.headers.Authorization, 'Bearer test-key');
    assert.equal(sent.body.model, 'deepseek-flash');
    assert.deepEqual(res.body.reading.paragraphs, ['Un primer párrafo.', 'Un segundo párrafo.']);
  } finally {
    globalThis.fetch = fetchBefore;
    if (previousKey === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.DEEPSEEK_MODEL;
    else process.env.DEEPSEEK_MODEL = previousModel;
  }
});
