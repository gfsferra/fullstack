/**
 * Testes unitários para NotFoundView
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import NotFoundView from '@/views/NotFoundView.vue';

describe('NotFoundView', () => {
  let router: ReturnType<typeof createRouter>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/404', name: 'not-found', component: NotFoundView },
      ],
    });
  });

  const mountComponent = async () => {
    await router.push('/404');
    await router.isReady();
    
    return mount(NotFoundView, {
      global: {
        plugins: [router],
      },
    });
  };

  describe('renderização', () => {
    it('deve exibir código 404', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('.not-found__code').text()).toBe('404');
    });

    it('deve exibir título "Página não encontrada"', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('.not-found__title').text()).toBe('Página não encontrada');
    });

    it('deve exibir mensagem explicativa', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('.not-found__message').text()).toContain('A página que você está procurando não existe');
    });

    it('deve renderizar botão de voltar ao início', async () => {
      const wrapper = await mountComponent();
      
      const button = wrapper.find('button');
      expect(button.exists()).toBe(true);
      expect(button.text()).toBe('Voltar ao início');
    });
  });

  describe('navegação', () => {
    it('deve navegar para home ao clicar no botão', async () => {
      const wrapper = await mountComponent();
      const pushSpy = vi.spyOn(router, 'push');
      
      await wrapper.find('button').trigger('click');
      
      expect(pushSpy).toHaveBeenCalledWith('/');
    });
  });

  describe('classes CSS', () => {
    it('deve ter classe principal not-found', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('.not-found').exists()).toBe(true);
    });

    it('deve ter conteúdo centralizado', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('.not-found__content').exists()).toBe(true);
    });

    it('botão deve ter classes de estilo primário', async () => {
      const wrapper = await mountComponent();
      
      const button = wrapper.find('button');
      expect(button.classes()).toContain('btn');
      expect(button.classes()).toContain('btn--primary');
    });
  });
});

