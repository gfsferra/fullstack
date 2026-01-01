/**
 * Ponto de entrada da aplicação Vue
 */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';

// Estilos globais SCSS
import './styles/main.scss';

// Cria instância da aplicação
const app = createApp(App);

// Plugins
app.use(createPinia());
app.use(router);

// Monta aplicação
app.mount('#app');

