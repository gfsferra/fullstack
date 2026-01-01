import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import api from '@/services/api';
import type { User } from '@/types';

/**
 * Interface para resposta paginada da API
 */
interface PaginatedResponse {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Interface para filtros de busca
 */
export interface UserFilters {
  name?: string;
  cpf?: string;
}

/**
 * Store de usuários
 * Gerencia o estado da listagem de usuários com paginação e filtros
 */
export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Paginação
  const currentPage = ref(1);
  const lastPage = ref(1);
  const perPage = ref(15);
  const total = ref(0);
  
  // Filtros
  const filters = ref<UserFilters>({});

  // Getters
  const userCount = computed(() => total.value);
  const hasNextPage = computed(() => currentPage.value < lastPage.value);
  const hasPreviousPage = computed(() => currentPage.value > 1);

  /**
   * Busca usuários com paginação e filtros
   */
  async function fetchUsers(page: number = 1): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', perPage.value.toString());
      
      if (filters.value.name) {
        params.append('name', filters.value.name);
      }
      if (filters.value.cpf) {
        params.append('cpf', filters.value.cpf);
      }

      const response = await api.get<PaginatedResponse>(`/users?${params.toString()}`);
      
      users.value = response.data.data;
      currentPage.value = response.data.current_page;
      lastPage.value = response.data.last_page;
      total.value = response.data.total;
    } catch (e: unknown) {
      const axiosError = e as { message?: string };
      error.value = axiosError.message || 'Erro ao carregar usuários';
      console.error('Erro ao buscar usuários:', e);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Aplica filtros e recarrega a lista
   */
  async function applyFilters(newFilters: UserFilters): Promise<void> {
    filters.value = { ...newFilters };
    await fetchUsers(1); // Volta para primeira página ao filtrar
  }

  /**
   * Limpa filtros e recarrega a lista
   */
  async function clearFilters(): Promise<void> {
    filters.value = {};
    await fetchUsers(1);
  }

  /**
   * Vai para próxima página
   */
  async function nextPage(): Promise<void> {
    if (hasNextPage.value) {
      await fetchUsers(currentPage.value + 1);
    }
  }

  /**
   * Vai para página anterior
   */
  async function previousPage(): Promise<void> {
    if (hasPreviousPage.value) {
      await fetchUsers(currentPage.value - 1);
    }
  }

  /**
   * Vai para página específica
   */
  async function goToPage(page: number): Promise<void> {
    if (page >= 1 && page <= lastPage.value) {
      await fetchUsers(page);
    }
  }

  /**
   * Limpa o estado
   */
  function clearState(): void {
    users.value = [];
    error.value = null;
    currentPage.value = 1;
    lastPage.value = 1;
    total.value = 0;
    filters.value = {};
  }

  return {
    // State
    users,
    loading,
    error,
    currentPage,
    lastPage,
    perPage,
    total,
    filters,
    // Getters
    userCount,
    hasNextPage,
    hasPreviousPage,
    // Actions
    fetchUsers,
    applyFilters,
    clearFilters,
    nextPage,
    previousPage,
    goToPage,
    clearState,
  };
});
