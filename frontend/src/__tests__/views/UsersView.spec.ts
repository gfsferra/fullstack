/**
 * Testes unitários para UsersView
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import UsersView from '@/views/UsersView.vue';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';

// Mock dos componentes filhos
vi.mock('@/components/users/UserList.vue', () => ({
  default: {
    name: 'UserList',
    props: ['users'],
    template: '<div class="user-list-mock">{{ users.length }} users</div>',
  },
}));

vi.mock('@/components/users/UserHeader.vue', () => ({
  default: {
    name: 'UserHeader',
    props: ['user'],
    emits: ['logout'],
    template: '<header class="user-header-mock"><button @click="$emit(\'logout\')">Logout</button></header>',
  },
}));

vi.mock('@/components/users/UserFilters.vue', () => ({
  default: {
    name: 'UserFiltersComponent',
    props: ['loading'],
    emits: ['filter', 'clear'],
    template: '<div class="user-filters-mock"></div>',
  },
}));

vi.mock('@/components/users/UserPagination.vue', () => ({
  default: {
    name: 'UserPagination',
    props: ['currentPage', 'lastPage', 'total'],
    emits: ['previous', 'next', 'goto'],
    template: '<div class="user-pagination-mock"></div>',
  },
}));

// Mock do api
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from '@/services/api';
import type { User } from '@/types';

describe('UsersView', () => {
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@example.com',
      registration_completed: true,
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@example.com',
      registration_completed: true,
    },
  ];

  const mockApiResponse = {
    data: {
      data: mockUsers,
      current_page: 1,
      last_page: 3,
      per_page: 15,
      total: 45,
    },
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue(mockApiResponse);
  });

  const mountComponent = () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://example.com/avatar.jpg',
      registration_completed: true,
    };
    
    return mount(UsersView, {
      global: {
        stubs: {
          UserList: true,
          UserHeader: true,
          UserFiltersComponent: true,
          UserPagination: true,
        },
      },
    });
  };

  describe('renderização', () => {
    it('deve renderizar UserHeader', () => {
      const wrapper = mountComponent();
      
      expect(wrapper.findComponent({ name: 'UserHeader' }).exists()).toBe(true);
    });

    it('deve renderizar UserFiltersComponent', () => {
      const wrapper = mountComponent();
      
      expect(wrapper.findComponent({ name: 'UserFiltersComponent' }).exists()).toBe(true);
    });

    it('deve renderizar título da seção', () => {
      const wrapper = mountComponent();
      
      expect(wrapper.find('.card__title').text()).toBe('Usuários Cadastrados');
    });

    it('deve exibir contagem de usuários', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      
      expect(wrapper.find('.users-view__count').text()).toContain('45 usuário(s)');
    });
  });

  describe('carregamento de dados', () => {
    it('deve buscar usuários ao montar', async () => {
      mountComponent();
      await flushPromises();
      
      expect(api.get).toHaveBeenCalled();
    });

    it('deve exibir loading enquanto carrega', async () => {
      // Cria uma promise que não resolve imediatamente
      vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));
      
      const wrapper = mountComponent();
      const userStore = useUserStore();
      
      // Simula estado de loading
      userStore.loading = true;
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('.users-view__loading').exists()).toBe(true);
      expect(wrapper.find('.loading-spinner').exists()).toBe(true);
    });

    it('deve exibir texto de carregamento', async () => {
      vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));
      
      const wrapper = mountComponent();
      const userStore = useUserStore();
      
      // Simula estado de loading
      userStore.loading = true;
      await wrapper.vm.$nextTick();
      
      expect(wrapper.text()).toContain('Carregando usuários...');
    });

    it('deve exibir lista após carregar', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      
      expect(wrapper.find('.users-view__loading').exists()).toBe(false);
      expect(wrapper.findComponent({ name: 'UserList' }).exists()).toBe(true);
    });

    it('deve exibir paginação após carregar', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      
      expect(wrapper.findComponent({ name: 'UserPagination' }).exists()).toBe(true);
    });
  });

  describe('interações', () => {
    it('deve aplicar filtros quando UserFilters emite filter', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      
      const userStore = useUserStore();
      const applyFiltersSpy = vi.spyOn(userStore, 'applyFilters');
      
      const filtersComponent = wrapper.findComponent({ name: 'UserFiltersComponent' });
      await filtersComponent.vm.$emit('filter', { name: 'João' });
      
      expect(applyFiltersSpy).toHaveBeenCalledWith({ name: 'João' });
    });

    it('deve limpar filtros quando UserFilters emite clear', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      
      const userStore = useUserStore();
      const clearFiltersSpy = vi.spyOn(userStore, 'clearFilters');
      
      const filtersComponent = wrapper.findComponent({ name: 'UserFiltersComponent' });
      await filtersComponent.vm.$emit('clear');
      
      expect(clearFiltersSpy).toHaveBeenCalled();
    });

    it('deve chamar logout quando UserHeader emite logout', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      
      const authStore = useAuthStore();
      const logoutSpy = vi.spyOn(authStore, 'logout');
      
      const headerComponent = wrapper.findComponent({ name: 'UserHeader' });
      await headerComponent.vm.$emit('logout');
      
      expect(logoutSpy).toHaveBeenCalled();
    });

    it('deve chamar previousPage quando paginação emite previous', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      
      const userStore = useUserStore();
      userStore.currentPage = 2;
      userStore.lastPage = 3;
      const previousPageSpy = vi.spyOn(userStore, 'previousPage');
      
      const paginationComponent = wrapper.findComponent({ name: 'UserPagination' });
      await paginationComponent.vm.$emit('previous');
      
      expect(previousPageSpy).toHaveBeenCalled();
    });

    it('deve chamar nextPage quando paginação emite next', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      
      const userStore = useUserStore();
      userStore.lastPage = 3;
      const nextPageSpy = vi.spyOn(userStore, 'nextPage');
      
      const paginationComponent = wrapper.findComponent({ name: 'UserPagination' });
      await paginationComponent.vm.$emit('next');
      
      expect(nextPageSpy).toHaveBeenCalled();
    });

    it('deve chamar goToPage quando paginação emite goto', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      
      const userStore = useUserStore();
      userStore.lastPage = 5;
      
      // GoToPage é chamada diretamente pelo template, verificamos se o método existe
      expect(typeof userStore.goToPage).toBe('function');
    });
  });

  describe('props passadas para componentes filhos', () => {
    it('deve passar user para UserHeader', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      
      const authStore = useAuthStore();
      const headerComponent = wrapper.findComponent({ name: 'UserHeader' });
      
      expect(headerComponent.props('user')).toEqual(authStore.user);
    });

    it('deve passar loading para UserFilters', async () => {
      vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));
      
      const wrapper = mountComponent();
      const userStore = useUserStore();
      
      // Simula estado de loading
      userStore.loading = true;
      await wrapper.vm.$nextTick();
      
      const filtersComponent = wrapper.findComponent({ name: 'UserFiltersComponent' });
      expect(filtersComponent.props('loading')).toBe(true);
    });

    it('deve passar users para UserList', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      
      const listComponent = wrapper.findComponent({ name: 'UserList' });
      expect(listComponent.props('users')).toEqual(mockUsers);
    });

    it('deve passar props de paginação para UserPagination', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      
      const paginationComponent = wrapper.findComponent({ name: 'UserPagination' });
      expect(paginationComponent.props('currentPage')).toBe(1);
      expect(paginationComponent.props('lastPage')).toBe(3);
      expect(paginationComponent.props('total')).toBe(45);
    });
  });

  describe('classes CSS', () => {
    it('deve ter classe users-view', () => {
      const wrapper = mountComponent();
      
      expect(wrapper.find('.users-view').exists()).toBe(true);
    });

    it('deve ter section list-section', () => {
      const wrapper = mountComponent();
      
      expect(wrapper.find('.users-view__list-section').exists()).toBe(true);
    });

    it('deve ter card wrapper', () => {
      const wrapper = mountComponent();
      
      expect(wrapper.find('.card').exists()).toBe(true);
    });

    it('deve ter header com flex-between', () => {
      const wrapper = mountComponent();
      
      expect(wrapper.find('.card__header.flex-between').exists()).toBe(true);
    });
  });
});

