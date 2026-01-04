/**
 * Testes unitários para o componente GoogleLoginButton
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton.vue';
import { useAuthStore } from '@/stores/authStore';

describe('GoogleLoginButton', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('deve renderizar o botão corretamente', () => {
    const wrapper = mount(GoogleLoginButton);
    
    expect(wrapper.find('button').exists()).toBe(true);
    expect(wrapper.find('.gsi-material-button').exists()).toBe(true);
  });

  it('deve exibir texto padrão quando não está carregando', () => {
    const wrapper = mount(GoogleLoginButton);
    
    expect(wrapper.text()).toContain('Fazer login com o Google');
  });

  it('deve exibir texto de carregamento quando loading é true', async () => {
    const wrapper = mount(GoogleLoginButton);
    const authStore = useAuthStore();
    authStore.loading = true;
    
    await wrapper.vm.$nextTick();
    
    expect(wrapper.text()).toContain('Conectando...');
  });

  it('deve desabilitar botão quando loading é true', async () => {
    const wrapper = mount(GoogleLoginButton);
    const authStore = useAuthStore();
    authStore.loading = true;
    
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });

  it('deve chamar loginWithGoogle ao clicar', async () => {
    const wrapper = mount(GoogleLoginButton);
    const authStore = useAuthStore();
    const loginSpy = vi.spyOn(authStore, 'loginWithGoogle');
    
    await wrapper.find('button').trigger('click');
    
    expect(loginSpy).toHaveBeenCalled();
  });

  it('deve renderizar o ícone do Google (SVG)', () => {
    const wrapper = mount(GoogleLoginButton);
    
    expect(wrapper.find('svg').exists()).toBe(true);
    expect(wrapper.find('.gsi-material-button-icon').exists()).toBe(true);
  });

  it('deve ter type="button" para evitar submit de forms', () => {
    const wrapper = mount(GoogleLoginButton);
    
    expect(wrapper.find('button').attributes('type')).toBe('button');
  });
});

