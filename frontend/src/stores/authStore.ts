import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { AuthUser, AuthState } from '@/types';

/**
 * Store de autenticação
 * Gerencia o estado do usuário autenticado e fluxo OAuth
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AuthUser | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const isRegistrationComplete = computed(() => user.value?.registration_completed ?? false);
  const needsRegistration = computed(() => isAuthenticated.value && !isRegistrationComplete.value);

  /**
   * Inicia fluxo de login com Google
   */
  function loginWithGoogle(): void {
    loading.value = true;
    error.value = null;
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/google/redirect`;
  }

  /**
   * Define o usuário autenticado
   */
  function setUser(authUser: AuthUser): void {
    user.value = authUser;
    localStorage.setItem('auth_user', JSON.stringify(authUser));
  }

  /**
   * Carrega usuário do localStorage
   */
  function loadFromStorage(): void {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        user.value = JSON.parse(stored);
      } catch {
        localStorage.removeItem('auth_user');
      }
    }
  }

  /**
   * Realiza logout
   */
  function logout(): void {
    user.value = null;
    localStorage.removeItem('auth_user');
    window.location.href = '/';
  }

  /**
   * Retorna o estado atual
   */
  function getState(): AuthState {
    return {
      user: user.value,
      loading: loading.value,
      error: error.value,
    };
  }

  // Carrega do storage ao inicializar
  loadFromStorage();

  return {
    // State
    user,
    loading,
    error,
    // Getters
    isAuthenticated,
    isRegistrationComplete,
    needsRegistration,
    // Actions
    loginWithGoogle,
    setUser,
    loadFromStorage,
    logout,
    getState,
  };
});
