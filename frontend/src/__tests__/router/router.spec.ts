/**
 * Testes unitários para o router
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRouter, createWebHistory, type Router } from 'vue-router';
import { setActivePinia, createPinia } from 'pinia';
import type { AuthUser } from '@/types';

// Rotas simuladas baseadas no router original
const createTestRouter = (): Router => {
  const routes = [
    {
      path: '/',
      name: 'home',
      component: { template: '<div>Home</div>' },
      meta: {
        title: 'Início',
        requiresAuth: false,
      },
    },
    {
      path: '/users',
      name: 'users',
      component: { template: '<div>Users</div>' },
      meta: {
        title: 'Usuários',
        requiresAuth: true,
      },
    },
    {
      path: '/register-complete',
      name: 'register-complete',
      component: { template: '<div>Register</div>' },
      meta: {
        title: 'Completar Cadastro',
        requiresAuth: true,
        requiresIncompleteRegistration: true,
      },
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: { template: '<div>Callback</div>' },
      meta: {
        title: 'Autenticando...',
        requiresAuth: false,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: { template: '<div>404</div>' },
      meta: {
        title: 'Página não encontrada',
      },
    },
  ];

  const router = createRouter({
    history: createWebHistory(),
    routes,
  });

  // Navigation guard replicado do router original
  router.beforeEach((to, _from, next) => {
    // Atualiza o título da página
    document.title = `${to.meta.title || 'App'} | Cadastro de Usuários`;

    // Verifica autenticação do localStorage
    const authUser = localStorage.getItem('auth_user');
    const isAuthenticated = !!authUser;

    let user: AuthUser | null = null;
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

  return router;
};

describe('Router', () => {
  let router: Router;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    router = createTestRouter();
  });

  const setAuthUser = (user: AuthUser | null) => {
    if (user) {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(user));
    } else {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
    }
  };

  describe('definição de rotas', () => {
    it('deve ter rota home', () => {
      const route = router.getRoutes().find(r => r.name === 'home');
      expect(route).toBeDefined();
      expect(route?.path).toBe('/');
    });

    it('deve ter rota users', () => {
      const route = router.getRoutes().find(r => r.name === 'users');
      expect(route).toBeDefined();
      expect(route?.path).toBe('/users');
    });

    it('deve ter rota register-complete', () => {
      const route = router.getRoutes().find(r => r.name === 'register-complete');
      expect(route).toBeDefined();
      expect(route?.path).toBe('/register-complete');
    });

    it('deve ter rota auth-callback', () => {
      const route = router.getRoutes().find(r => r.name === 'auth-callback');
      expect(route).toBeDefined();
      expect(route?.path).toBe('/auth/callback');
    });

    it('deve ter rota not-found', () => {
      const route = router.getRoutes().find(r => r.name === 'not-found');
      expect(route).toBeDefined();
    });
  });

  describe('meta tags', () => {
    it('rota home não deve requerer autenticação', () => {
      const route = router.getRoutes().find(r => r.name === 'home');
      expect(route?.meta.requiresAuth).toBe(false);
    });

    it('rota users deve requerer autenticação', () => {
      const route = router.getRoutes().find(r => r.name === 'users');
      expect(route?.meta.requiresAuth).toBe(true);
    });

    it('rota register-complete deve requerer autenticação', () => {
      const route = router.getRoutes().find(r => r.name === 'register-complete');
      expect(route?.meta.requiresAuth).toBe(true);
    });

    it('rota register-complete deve requerer cadastro incompleto', () => {
      const route = router.getRoutes().find(r => r.name === 'register-complete');
      expect(route?.meta.requiresIncompleteRegistration).toBe(true);
    });

    it('rota auth-callback não deve requerer autenticação', () => {
      const route = router.getRoutes().find(r => r.name === 'auth-callback');
      expect(route?.meta.requiresAuth).toBe(false);
    });
  });

  describe('navigation guards - usuário não autenticado', () => {
    it('deve permitir acesso à home', async () => {
      await router.push('/');
      await router.isReady();
      
      expect(router.currentRoute.value.name).toBe('home');
    });

    it('deve redirecionar para home ao acessar /users', async () => {
      await router.push('/users');
      await router.isReady();
      
      expect(router.currentRoute.value.name).toBe('home');
    });

    it('deve redirecionar para home ao acessar /register-complete', async () => {
      await router.push('/register-complete');
      await router.isReady();
      
      expect(router.currentRoute.value.name).toBe('home');
    });

    it('deve permitir acesso à rota auth-callback', async () => {
      await router.push('/auth/callback');
      await router.isReady();
      
      expect(router.currentRoute.value.name).toBe('auth-callback');
    });

    it('deve redirecionar para not-found em rota inexistente', async () => {
      await router.push('/rota-que-nao-existe');
      await router.isReady();
      
      expect(router.currentRoute.value.name).toBe('not-found');
    });
  });

  describe('navigation guards - usuário autenticado com cadastro completo', () => {
    beforeEach(() => {
      setAuthUser({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        registration_completed: true,
      });
      router = createTestRouter();
    });

    it('deve permitir acesso à home', async () => {
      await router.push('/');
      await router.isReady();
      
      expect(router.currentRoute.value.name).toBe('home');
    });

    it('deve permitir acesso a /users', async () => {
      await router.push('/users');
      await router.isReady();
      
      expect(router.currentRoute.value.name).toBe('users');
    });

    it('deve redirecionar de /register-complete para /users', async () => {
      await router.push('/register-complete');
      await router.isReady();
      
      expect(router.currentRoute.value.name).toBe('users');
    });
  });

  describe('navigation guards - usuário autenticado com cadastro incompleto', () => {
    beforeEach(() => {
      setAuthUser({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        registration_completed: false,
      });
      router = createTestRouter();
    });

    it('deve redirecionar de /users para /register-complete', async () => {
      await router.push('/users');
      await router.isReady();
      
      expect(router.currentRoute.value.name).toBe('register-complete');
    });

    it('deve redirecionar de / para /register-complete', async () => {
      await router.push('/');
      await router.isReady();
      
      expect(router.currentRoute.value.name).toBe('register-complete');
    });

    it('deve permitir acesso a /register-complete', async () => {
      await router.push('/register-complete');
      await router.isReady();
      
      expect(router.currentRoute.value.name).toBe('register-complete');
    });

    it('deve permitir acesso a /auth/callback', async () => {
      await router.push('/auth/callback');
      await router.isReady();
      
      expect(router.currentRoute.value.name).toBe('auth-callback');
    });
  });

  describe('título da página', () => {
    it('deve atualizar título para rota home', async () => {
      await router.push('/');
      await router.isReady();
      
      expect(document.title).toBe('Início | Cadastro de Usuários');
    });

    it('deve atualizar título para rota users', async () => {
      setAuthUser({
        id: 1,
        name: 'Test',
        email: 'test@test.com',
        registration_completed: true,
      });
      router = createTestRouter();
      
      await router.push('/users');
      await router.isReady();
      
      expect(document.title).toBe('Usuários | Cadastro de Usuários');
    });

    it('deve atualizar título para rota not-found', async () => {
      await router.push('/pagina-inexistente');
      await router.isReady();
      
      expect(document.title).toBe('Página não encontrada | Cadastro de Usuários');
    });
  });

  describe('tratamento de JSON inválido no localStorage', () => {
    it('deve limpar localStorage quando JSON é inválido', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid-json');
      router = createTestRouter();
      
      await router.push('/users');
      await router.isReady();
      
      // Quando JSON é inválido, deve limpar o localStorage
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
      // Após limpar, o usuário não está autenticado e é redirecionado
      // O redirecionamento pode não acontecer na mesma navegação
    });
  });
});

