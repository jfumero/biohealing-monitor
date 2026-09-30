import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        dia: resolve(import.meta.dirname, 'index.html'),
        monitor: resolve(import.meta.dirname, 'visualizacion.html'),
        ciclos: resolve(import.meta.dirname, 'ciclos.html'),
        diagnostico: resolve(import.meta.dirname, 'diag.html'),
      },
    },
  },
});
