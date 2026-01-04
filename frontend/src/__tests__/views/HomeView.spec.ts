/**
 * Testes unitários para HomeView
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton.vue';
import { useAuthStore } from '@/stores/authStore';

// Mock do componente GoogleLoginButton para simplificar testes
vi.mock('@/components/ui/GoogleLoginButton.vue', () => ({
  default: {
    name: 'GoogleLoginButton',
    template: '<button class="google-login-btn">Login</button>',
  },
}));

describe('HomeView', () => {
  let router: ReturnType<typeof createRouter>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/users', name: 'users', component: { template: '<div>Users</div>' } },
        { path: '/register-complete', name: 'register-complete', component: { template: '<div>Register</div>' } },
      ],
    });
  });

  const mountComponent = async () => {
    await router.push('/');
    await router.isReady();
    
    return mount(HomeView, {
      global: {
        plugins: [router],
        stubs: {
          GoogleLoginButton: true,
        },
      },
    });
  };

  describe('renderização', () => {
    it('deve renderizar o título corretamente', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('.home__title').text()).toContain('Cadastro de');
      expect(wrapper.find('.home__title').text()).toContain('Usuários');
    });

    it('deve exibir badge de sistema', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('.home__badge').text()).toContain('Sistema de Cadastro');
    });

    it('deve exibir subtítulo', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('.home__subtitle').text()).toContain('Google OAuth');
    });

    it('deve renderizar botão de login do Google', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.findComponent({ name: 'GoogleLoginButton' }).exists()).toBe(true);
    });

    it('deve exibir informação sobre login', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('.home__info').text()).toContain('Faça login com sua conta Google');
    });
  });

  describe('feature cards', () => {
    it('deve renderizar 3 cards de features', async () => {
      const wrapper = await mountComponent();
      
      const cards = wrapper.findAll('.feature-card');
      expect(cards).toHaveLength(3);
    });

    it('deve exibir card de Login Seguro com ícone SVG', async () => {
      const wrapper = await mountComponent();
      
      const cards = wrapper.findAll('.feature-card');
      expect(cards[0].find('.feature-card__icon').exists()).toBe(true);
      expect(cards[0].find('.feature-card__title').text()).toBe('Login Seguro');
      expect(cards[0].find('.feature-card__description').text()).toContain('OAuth 2.0');
    });

    it('deve exibir card de Gestão de Usuários com ícone SVG', async () => {
      const wrapper = await mountComponent();
      
      const cards = wrapper.findAll('.feature-card');
      expect(cards[1].find('.feature-card__icon').exists()).toBe(true);
      expect(cards[1].find('.feature-card__title').text()).toBe('Gestão de Usuários');
    });

    it('deve exibir card de Notificações com ícone SVG', async () => {
      const wrapper = await mountComponent();
      
      const cards = wrapper.findAll('.feature-card');
      expect(cards[2].find('.feature-card__icon').exists()).toBe(true);
      expect(cards[2].find('.feature-card__title').text()).toBe('Notificações');
    });
    
    it('deve ter ícones wrapper para todos os cards', async () => {
      const wrapper = await mountComponent();
      
      const iconWrappers = wrapper.findAll('.feature-card__icon-wrapper');
      expect(iconWrappers).toHaveLength(3);
    });
  });

  describe('redirecionamento', () => {
    it('deve redirecionar para /users quando autenticado com cadastro completo', async () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        registration_completed: true,
      };
      
      await router.push('/');
      await router.isReady();
      
      const pushSpy = vi.spyOn(router, 'push');
      
      mount(HomeView, {
        global: {
          plugins: [router],
          stubs: { GoogleLoginButton: true },
        },
      });
      
      expect(pushSpy).toHaveBeenCalledWith('/users');
    });

    it('deve redirecionar para /register-complete quando autenticado com cadastro incompleto', async () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        registration_completed: false,
      };
      
      await router.push('/');
      await router.isReady();
      
      const pushSpy = vi.spyOn(router, 'push');
      
      mount(HomeView, {
        global: {
          plugins: [router],
          stubs: { GoogleLoginButton: true },
        },
      });
      
      expect(pushSpy).toHaveBeenCalledWith('/register-complete');
    });

    it('não deve redirecionar quando não autenticado', async () => {
      await router.push('/');
      await router.isReady();
      
      const pushSpy = vi.spyOn(router, 'push');
      
      mount(HomeView, {
        global: {
          plugins: [router],
          stubs: { GoogleLoginButton: true },
        },
      });
      
      // Não deve ter chamadas de redirecionamento
      expect(pushSpy).not.toHaveBeenCalled();
    });
  });
});
