import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        inscription: resolve(__dirname, 'inscription.html'),
        reglement: resolve(__dirname, 'reglement.html'),
        scoreboard: resolve(__dirname, 'scoreboard.html')
      }
    }
  }
});
