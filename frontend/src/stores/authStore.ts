import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { AuthUser, AuthState } from '@/types';

/**
 * Interface para usuário autenticado
 * @interface AuthUser
 * @property {number} id - ID do usuário
 * @property {string} name - Nome do usuário
 * @property {string} email - E-mail do usuário
 * @property {string} avatar - URL do avatar
 * @property {boolean} registration_completed - Se o cadastro está completo
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);
  const isRegistrationComplete = computed(() => user.value?.registration_completed ?? false);
  const needsRegistration = computed(() => isAuthenticated.value && !isRegistrationComplete.value);

  function loginWithGoogle(): void {
    loading.value = true;
    error.value = null;
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/google/redirect`;
  }

  function setUser(authUser: AuthUser): void {
    user.value = authUser;
    localStorage.setItem('auth_user', JSON.stringify(authUser));
  }

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

  function logout(): void {
    user.value = null;
    localStorage.removeItem('auth_user');
    window.location.href = '/';
  }

  function getState(): AuthState {
    return {
      user: user.value,
      loading: loading.value,
      error: error.value,
    };
  }

  loadFromStorage();

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isRegistrationComplete,
    needsRegistration,
    loginWithGoogle,
    setUser,
    loadFromStorage,
    logout,
    getState,
  };
});