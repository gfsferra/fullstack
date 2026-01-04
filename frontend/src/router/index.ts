import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

/**
 * Definição das rotas da aplicação
 * @router routes
 * @property {RouteRecordRaw[]} routes - Rotas da aplicação
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
 * @navigation guard beforeEach
 * @param {RouteLocationNormalized} to - Rota atual
 * @param {RouteLocationNormalized} from - Rota anterior
 * @param {NavigationGuardNext} next - Função para continuar a navegação
 */
router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'App'} | Cadastro de Usuários`;

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

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'home' });
  }

  if (to.meta.requiresIncompleteRegistration && user?.registration_completed) {
    return next({ name: 'users' });
  }

  if (isAuthenticated && user && !user.registration_completed && to.name !== 'register-complete' && to.name !== 'auth-callback') {
    return next({ name: 'register-complete' });
  }

  next();
});

export default router;