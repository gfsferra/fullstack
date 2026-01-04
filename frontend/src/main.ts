import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';

import './styles/main.scss';

/**
 * Cria a instância da aplicação
 * @function createApp
 * @returns {App} Instância da aplicação
 */
const app = createApp(App);

/**
 * Usa o Pinia para gerenciamento de estado
 * @function usePinia
 * @returns {void}
 */
app.use(createPinia());

/**
 * Usa o Vue Router para navegação
 * @function useRouter
 * @returns {void}
 */
app.use(router);

/**
 * Monta a aplicação no elemento #app
 * @function mount
 * @returns {void}
 */
app.mount('#app');