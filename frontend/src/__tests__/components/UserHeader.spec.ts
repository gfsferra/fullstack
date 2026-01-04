/**
 * Testes unitários para o componente UserHeader
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import UserHeader from '@/components/users/UserHeader.vue';
import type { AuthUser } from '@/types';

describe('UserHeader', () => {
  const mockUser: AuthUser = {
    id: 1,
    name: 'João Silva',
    email: 'joao@example.com',
    avatar: 'https://example.com/avatar.jpg',
    registration_completed: true,
  };

  it('deve renderizar o título corretamente', () => {
    const wrapper = mount(UserHeader, {
      props: { user: mockUser },
    });
    
    expect(wrapper.find('.user-header__title').text()).toContain('Cadastro de Usuários');
  });

  it('deve exibir ícone SVG do logo', () => {
    const wrapper = mount(UserHeader, {
      props: { user: mockUser },
    });
    
    expect(wrapper.find('.user-header__logo').exists()).toBe(true);
  });

  it('deve exibir informações do usuário quando logado', () => {
    const wrapper = mount(UserHeader, {
      props: { user: mockUser },
    });
    
    expect(wrapper.find('.user-header__name').text()).toBe('João Silva');
  });

  it('deve exibir avatar do usuário', () => {
    const wrapper = mount(UserHeader, {
      props: { user: mockUser },
    });
    
    const avatar = wrapper.find('.user-header__avatar');
    expect(avatar.exists()).toBe(true);
    expect(avatar.attributes('src')).toBe(mockUser.avatar);
    expect(avatar.attributes('alt')).toBe(mockUser.name);
  });

  it('deve exibir avatar placeholder quando não existe imagem', () => {
    const userWithoutAvatar: AuthUser = {
      ...mockUser,
      avatar: undefined,
    };
    
    const wrapper = mount(UserHeader, {
      props: { user: userWithoutAvatar },
    });
    
    const placeholder = wrapper.find('.user-header__avatar--placeholder');
    expect(placeholder.exists()).toBe(true);
    expect(placeholder.text()).toBe('J');
  });

  it('não deve exibir informações do usuário quando null', () => {
    const wrapper = mount(UserHeader, {
      props: { user: null },
    });
    
    expect(wrapper.find('.user-header__user-info').exists()).toBe(false);
  });

  it('deve exibir botão de logout', () => {
    const wrapper = mount(UserHeader, {
      props: { user: mockUser },
    });
    
    const logoutBtn = wrapper.find('button');
    expect(logoutBtn.exists()).toBe(true);
    expect(logoutBtn.text()).toContain('Sair');
  });

  it('deve emitir evento logout ao clicar no botão', async () => {
    const wrapper = mount(UserHeader, {
      props: { user: mockUser },
    });
    
    await wrapper.find('button').trigger('click');
    
    expect(wrapper.emitted('logout')).toBeTruthy();
    expect(wrapper.emitted('logout')).toHaveLength(1);
  });

  it('deve ter referrerpolicy no avatar para privacidade', () => {
    const wrapper = mount(UserHeader, {
      props: { user: mockUser },
    });
    
    const avatar = wrapper.find('.user-header__avatar');
    expect(avatar.attributes('referrerpolicy')).toBe('no-referrer');
  });
  
  it('deve exibir ícone SVG de logout', () => {
    const wrapper = mount(UserHeader, {
      props: { user: mockUser },
    });
    
    expect(wrapper.find('.user-header__logout-icon').exists()).toBe(true);
  });
});
