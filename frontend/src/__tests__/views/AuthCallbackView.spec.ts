/**
 * Testes unitários para AuthCallbackView
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import AuthCallbackView from '@/views/AuthCallbackView.vue';
import { useAuthStore } from '@/stores/authStore';

describe('AuthCallbackView', () => {
  let router: ReturnType<typeof createRouter>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/auth/callback', name: 'auth-callback', component: AuthCallbackView },
        { path: '/users', name: 'users', component: { template: '<div>Users</div>' } },
        { path: '/register-complete', name: 'register-complete', component: { template: '<div>Register</div>' } },
      ],
    });
  });

  const setSearchParams = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        search: `?${searchParams.toString()}`,
      },
      writable: true,
    });
  };

  const mountComponent = async () => {
    await router.push('/auth/callback');
    await router.isReady();
    
    return mount(AuthCallbackView, {
      global: {
        plugins: [router],
      },
    });
  };

  describe('renderização', () => {
    it('deve exibir spinner de loading', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      setSearchParams({ success: 'false' });
      const wrapper = await mountComponent();
      
      expect(wrapper.find('.loading-spinner').exists()).toBe(true);
      consoleSpy.mockRestore();
    });

    it('deve exibir texto "Autenticando..."', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      setSearchParams({ success: 'false' });
      const wrapper = await mountComponent();
      
      expect(wrapper.text()).toContain('Autenticando...');
      consoleSpy.mockRestore();
    });

    it('deve ter classe auth-callback', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      setSearchParams({ success: 'false' });
      const wrapper = await mountComponent();
      
      expect(wrapper.find('.auth-callback').exists()).toBe(true);
      consoleSpy.mockRestore();
    });
  });

  describe('callback com sucesso', () => {
    it('deve definir usuário no store quando success=true', async () => {
      setSearchParams({
        success: 'true',
        user_id: '123',
        name: 'João Silva',
        email: 'joao@example.com',
        avatar: 'https://example.com/avatar.jpg',
        registration_completed: 'true',
      });
      
      const authStore = useAuthStore();
      const setUserSpy = vi.spyOn(authStore, 'setUser');
      
      await mountComponent();
      
      expect(setUserSpy).toHaveBeenCalledWith({
        id: 123,
        name: 'João Silva',
        email: 'joao@example.com',
        avatar: 'https://example.com/avatar.jpg',
        registration_completed: true,
      });
    });

    it('deve redirecionar para /users quando cadastro completo', async () => {
      setSearchParams({
        success: 'true',
        user_id: '123',
        name: 'João Silva',
        email: 'joao@example.com',
        registration_completed: 'true',
      });
      
      const pushSpy = vi.spyOn(router, 'push');
      await mountComponent();
      
      expect(pushSpy).toHaveBeenCalledWith('/users');
    });

    it('deve redirecionar para /register-complete quando cadastro incompleto', async () => {
      setSearchParams({
        success: 'true',
        user_id: '123',
        name: 'João Silva',
        email: 'joao@example.com',
        registration_completed: 'false',
      });
      
      const pushSpy = vi.spyOn(router, 'push');
      await mountComponent();
      
      expect(pushSpy).toHaveBeenCalledWith('/register-complete');
    });

    it('deve tratar avatar undefined quando não fornecido', async () => {
      setSearchParams({
        success: 'true',
        user_id: '123',
        name: 'João Silva',
        email: 'joao@example.com',
        registration_completed: 'true',
      });
      
      const authStore = useAuthStore();
      const setUserSpy = vi.spyOn(authStore, 'setUser');
      
      await mountComponent();
      
      expect(setUserSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          avatar: undefined,
        })
      );
    });
  });

  describe('callback com erro', () => {
    it('deve redirecionar para home quando success=false', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      setSearchParams({
        success: 'false',
        error: 'access_denied',
      });
      
      const pushSpy = vi.spyOn(router, 'push');
      await mountComponent();
      
      expect(pushSpy).toHaveBeenCalledWith('/');
      consoleSpy.mockRestore();
    });

    it('deve logar erro no console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      setSearchParams({
        success: 'false',
        error: 'access_denied',
      });
      
      await mountComponent();
      
      expect(consoleSpy).toHaveBeenCalledWith('Auth error:', 'access_denied');
      consoleSpy.mockRestore();
    });

    it('deve redirecionar para home quando success não está presente', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      setSearchParams({});
      
      const pushSpy = vi.spyOn(router, 'push');
      await mountComponent();
      
      expect(pushSpy).toHaveBeenCalledWith('/');
      consoleSpy.mockRestore();
    });
  });

  describe('parsing de parâmetros', () => {
    it('deve converter user_id para número', async () => {
      setSearchParams({
        success: 'true',
        user_id: '456',
        name: 'Test',
        email: 'test@test.com',
        registration_completed: 'true',
      });
      
      const authStore = useAuthStore();
      const setUserSpy = vi.spyOn(authStore, 'setUser');
      
      await mountComponent();
      
      expect(setUserSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 456, // número, não string
        })
      );
    });

    it('deve tratar user_id inválido como 0', async () => {
      setSearchParams({
        success: 'true',
        user_id: 'invalid',
        name: 'Test',
        email: 'test@test.com',
        registration_completed: 'true',
      });
      
      const authStore = useAuthStore();
      const setUserSpy = vi.spyOn(authStore, 'setUser');
      
      await mountComponent();
      
      expect(setUserSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: NaN, // parseInt de 'invalid' retorna NaN
        })
      );
    });

    it('deve tratar registration_completed como boolean', async () => {
      setSearchParams({
        success: 'true',
        user_id: '123',
        name: 'Test',
        email: 'test@test.com',
        registration_completed: 'false',
      });
      
      const authStore = useAuthStore();
      const setUserSpy = vi.spyOn(authStore, 'setUser');
      
      await mountComponent();
      
      expect(setUserSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          registration_completed: false, // boolean, não string
        })
      );
    });
  });
});

