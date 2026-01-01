import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

/**
 * Definição das rotas da aplicação
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'Início',
      requiresAuth: false,
    },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UsersView.vue'),
    meta: {
      title: 'Usuários',
      requiresAuth: true,
    },
  },
  {
    path: '/register-complete',
    name: 'register-complete',
    component: () => import('@/views/RegisterCompleteView.vue'),
    meta: {
      title: 'Completar Cadastro',
      requiresAuth: true,
      requiresIncompleteRegistration: true,
    },
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('@/views/AuthCallbackView.vue'),
    meta: {
      title: 'Autenticando...',
      requiresAuth: false,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: 'Página não encontrada',
    },
  },
];

/**
 * Instância do router Vue
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

/**
 * Navigation guard para verificar autenticação
 */
router.beforeEach((to, _from, next) => {
  // Atualiza o título da página
  document.title = `${to.meta.title || 'App'} | Cadastro de Usuários`;

  // Verifica autenticação do localStorage
  const authUser = localStorage.getItem('auth_user');
  const isAuthenticated = !!authUser;

  let user = null;
  if (authUser) {
    try {
      user = JSON.parse(authUser);
    } catch {
      localStorage.removeItem('auth_user');
    }
  }

  // Rota requer autenticação
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'home' });
  }

  // Rota requer cadastro incompleto
  if (to.meta.requiresIncompleteRegistration && user?.registration_completed) {
    return next({ name: 'users' });
  }

  // Usuário autenticado com cadastro incompleto tentando acessar outras páginas
  if (isAuthenticated && user && !user.registration_completed && to.name !== 'register-complete' && to.name !== 'auth-callback') {
    return next({ name: 'register-complete' });
  }

  next();
});

export default router;

