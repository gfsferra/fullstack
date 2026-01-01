import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

/**
 * Configuração do Vite
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Permite usar variáveis e mixins globalmente
        api: 'modern-compiler',
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});

