import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import api from '@/services/api';
import type { User } from '@/types';

/**
 * Store de usuários
 * Gerencia o estado da listagem de usuários
 */
export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const userCount = computed(() => users.value.length);
  const registeredUsers = computed(() => users.value.filter(u => u.registration_completed));
  const pendingUsers = computed(() => users.value.filter(u => !u.registration_completed));

  /**
   * Busca todos os usuários
   */
  async function fetchUsers(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get<User[]>('/users');
      users.value = response.data;
    } catch (e: unknown) {
      const axiosError = e as { message?: string };
      error.value = axiosError.message || 'Erro ao carregar usuários';
      console.error('Erro ao buscar usuários:', e);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Busca um usuário pelo ID
   */
  async function fetchUser(id: number): Promise<User | null> {
    try {
      const response = await api.get<User>(`/users/${id}`);
      return response.data;
    } catch (e) {
      console.error('Erro ao buscar usuário:', e);
      return null;
    }
  }

  /**
   * Limpa o estado
   */
  function clearState(): void {
    users.value = [];
    error.value = null;
  }

  return {
    // State
    users,
    loading,
    error,
    // Getters
    userCount,
    registeredUsers,
    pendingUsers,
    // Actions
    fetchUsers,
    fetchUser,
    clearState,
  };
});
