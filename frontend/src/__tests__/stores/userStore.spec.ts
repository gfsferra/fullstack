import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/userStore';
import type { User } from '@/types';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from '@/services/api';

describe('userStore', () => {
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@example.com',
      birth_date: '1990-05-15',
      cpf: '123.456.789-00',
      registration_completed: true,
      age: 35,
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@example.com',
      birth_date: '1985-10-20',
      cpf: '987.654.321-00',
      registration_completed: true,
      age: 40,
    },
  ];

  const mockPaginatedResponse = {
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
  });

  describe('estado inicial', () => {
    it('DADO QUE o store foi inicializado, QUANDO acessar users, ENTÃO deve ser array vazio', () => {
      const store = useUserStore();
      expect(store.users).toEqual([]);
    });

    it('DADO QUE o store foi inicializado, QUANDO acessar loading, ENTÃO deve ser false', () => {
      const store = useUserStore();
      expect(store.loading).toBe(false);
    });

    it('DADO QUE o store foi inicializado, QUANDO acessar error, ENTÃO deve ser null', () => {
      const store = useUserStore();
      expect(store.error).toBeNull();
    });

    it('DADO QUE o store foi inicializado, QUANDO acessar paginação, ENTÃO deve ter valores padrão', () => {
      const store = useUserStore();
      expect(store.currentPage).toBe(1);
      expect(store.lastPage).toBe(1);
      expect(store.perPage).toBe(15);
      expect(store.total).toBe(0);
    });

    it('DADO QUE o store foi inicializado, QUANDO acessar filters, ENTÃO deve ser objeto vazio', () => {
      const store = useUserStore();
      expect(store.filters).toEqual({});
    });
  });

  describe('getters', () => {
    it('DADO QUE total é igual a 100, QUANDO acessar userCount, ENTÃO deve retornar 100', () => {
      const store = useUserStore();
      store.total = 100;
      expect(store.userCount).toBe(100);
    });

    it('DADO QUE currentPage é 1 e lastPage é 3, QUANDO verificar hasNextPage, ENTÃO deve retornar true', () => {
      const store = useUserStore();
      store.currentPage = 1;
      store.lastPage = 3;
      expect(store.hasNextPage).toBe(true);
    });

    it('DADO QUE currentPage é igual a lastPage, QUANDO verificar hasNextPage, ENTÃO deve retornar false', () => {
      const store = useUserStore();
      store.currentPage = 3;
      store.lastPage = 3;
      expect(store.hasNextPage).toBe(false);
    });

    it('DADO QUE currentPage é igual a 1, QUANDO verificar hasPreviousPage, ENTÃO deve retornar false', () => {
      const store = useUserStore();
      store.currentPage = 1;
      expect(store.hasPreviousPage).toBe(false);
    });

    it('DADO QUE currentPage é maior que 1, QUANDO verificar hasPreviousPage, ENTÃO deve retornar true', () => {
      const store = useUserStore();
      store.currentPage = 2;
      expect(store.hasPreviousPage).toBe(true);
    });
  });

  describe('fetchUsers', () => {
    it('DADO QUE a API está disponível, QUANDO chamar fetchUsers, ENTÃO loading deve ser true durante a requisição', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();

      const promise = store.fetchUsers();
      expect(store.loading).toBe(true);

      await promise;
      expect(store.loading).toBe(false);
    });

    it('DADO QUE existe error no state, QUANDO chamar fetchUsers, ENTÃO deve limpar error', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();
      store.error = 'Previous error';

      await store.fetchUsers();

      expect(store.error).toBeNull();
    });

    it('DADO QUE a API retorna usuários, QUANDO chamar fetchUsers, ENTÃO deve popular users com os dados', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();

      await store.fetchUsers();

      expect(store.users).toEqual(mockUsers);
    });

    it('DADO QUE a API retorna dados de paginação, QUANDO chamar fetchUsers, ENTÃO deve atualizar informações de paginação', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();

      await store.fetchUsers();

      expect(store.currentPage).toBe(1);
      expect(store.lastPage).toBe(3);
      expect(store.total).toBe(45);
    });

    it('DADO QUE página 2 é solicitada, QUANDO chamar fetchUsers(2), ENTÃO deve fazer requisição com page=2', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();

      await store.fetchUsers(2);

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('page=2'));
    });

    it('DADO QUE existem filtros definidos, QUANDO chamar fetchUsers, ENTÃO deve incluir filtros na requisição', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();
      store.filters = { name: 'João', cpf: '123' };

      await store.fetchUsers();

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('name=Jo'));
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('cpf=123'));
    });

    it('DADO QUE a API falha com erro, QUANDO chamar fetchUsers, ENTÃO deve definir error com a mensagem', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));
      const store = useUserStore();

      await store.fetchUsers();

      expect(store.error).toBe('Network error');
      consoleSpy.mockRestore();
    });

    it('DADO QUE a API falha sem mensagem de erro, QUANDO chamar fetchUsers, ENTÃO deve usar mensagem padrão', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(api.get).mockRejectedValue({});
      const store = useUserStore();

      await store.fetchUsers();

      expect(store.error).toBe('Erro ao carregar usuários');
      consoleSpy.mockRestore();
    });
  });

  describe('applyFilters', () => {
    it('DADO QUE novos filtros são fornecidos, QUANDO chamar applyFilters, ENTÃO deve atualizar filtros no state', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();

      await store.applyFilters({ name: 'Test', cpf: '123' });

      expect(store.filters).toEqual({ name: 'Test', cpf: '123' });
    });

    it('DADO QUE a página atual é 3, QUANDO chamar applyFilters, ENTÃO deve voltar para primeira página', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();
      store.currentPage = 3;

      await store.applyFilters({ name: 'Test' });

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('page=1'));
    });

    it('DADO QUE filtros são aplicados, QUANDO chamar applyFilters, ENTÃO deve buscar usuários', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();

      await store.applyFilters({ name: 'Test' });

      expect(api.get).toHaveBeenCalled();
    });
  });

  describe('clearFilters', () => {
    it('DADO QUE existem filtros definidos, QUANDO chamar clearFilters, ENTÃO deve limpar todos os filtros', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();
      store.filters = { name: 'Test', cpf: '123' };

      await store.clearFilters();

      expect(store.filters).toEqual({});
    });

    it('DADO QUE qualquer estado do store, QUANDO chamar clearFilters, ENTÃO deve recarregar da primeira página', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();

      await store.clearFilters();

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('page=1'));
    });
  });

  describe('nextPage', () => {
    it('DADO QUE currentPage é 1 e lastPage é 3, QUANDO chamar nextPage, ENTÃO deve buscar página 2', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();
      store.currentPage = 1;
      store.lastPage = 3;

      await store.nextPage();

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('page=2'));
    });

    it('DADO QUE currentPage é igual a lastPage, QUANDO chamar nextPage, ENTÃO não deve fazer requisição', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();
      store.currentPage = 3;
      store.lastPage = 3;

      await store.nextPage();

      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe('previousPage', () => {
    it('DADO QUE currentPage é 2, QUANDO chamar previousPage, ENTÃO deve buscar página 1', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();
      store.currentPage = 2;
      store.lastPage = 3;

      await store.previousPage();

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('page=1'));
    });

    it('DADO QUE currentPage é igual a 1, QUANDO chamar previousPage, ENTÃO não deve fazer requisição', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();
      store.currentPage = 1;

      await store.previousPage();

      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe('goToPage', () => {
    it('DADO QUE página 3 é válida e lastPage é 5, QUANDO chamar goToPage(3), ENTÃO deve buscar página 3', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();
      store.lastPage = 5;

      await store.goToPage(3);

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('page=3'));
    });

    it('DADO QUE página solicitada é 0, QUANDO chamar goToPage(0), ENTÃO não deve fazer requisição', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();

      await store.goToPage(0);

      expect(api.get).not.toHaveBeenCalled();
    });

    it('DADO QUE página solicitada é maior que lastPage, QUANDO chamar goToPage, ENTÃO não deve fazer requisição', async () => {
      vi.mocked(api.get).mockResolvedValue(mockPaginatedResponse);
      const store = useUserStore();
      store.lastPage = 3;

      await store.goToPage(5);

      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe('clearState', () => {
    it('DADO QUE o store possui dados, QUANDO chamar clearState, ENTÃO deve resetar todo o estado', () => {
      const store = useUserStore();
      store.users = mockUsers;
      store.error = 'Some error';
      store.currentPage = 5;
      store.lastPage = 10;
      store.total = 100;
      store.filters = { name: 'Test' };

      store.clearState();

      expect(store.users).toEqual([]);
      expect(store.error).toBeNull();
      expect(store.currentPage).toBe(1);
      expect(store.lastPage).toBe(1);
      expect(store.total).toBe(0);
      expect(store.filters).toEqual({});
    });
  });
});
