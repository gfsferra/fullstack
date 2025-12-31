import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  registration_completed: boolean;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!user.value);
  const needsRegistration = computed(() => user.value && !user.value.registration_completed);

  function loginWithGoogle() {
    // Redirect to Laravel's Google OAuth endpoint
    window.location.href = 'http://localhost:8000/api/auth/google/redirect';
  }

  function handleCallback(): boolean {
    // Parse URL parameters after Google callback
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    
    if (success === 'true') {
      user.value = {
        id: parseInt(urlParams.get('user_id') || '0'),
        name: urlParams.get('name') || '',
        email: urlParams.get('email') || '',
        avatar: urlParams.get('avatar') || undefined,
        registration_completed: urlParams.get('registration_completed') === 'true',
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('auth_user', JSON.stringify(user.value));
      
      // Clean URL
      window.history.replaceState({}, document.title, '/');
      
      return true;
    }
    
    return false;
  }

  function loadFromStorage() {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        user.value = JSON.parse(stored);
      } catch {
        localStorage.removeItem('auth_user');
      }
    }
  }

  function completeRegistration() {
    if (user.value) {
      user.value.registration_completed = true;
      localStorage.setItem('auth_user', JSON.stringify(user.value));
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    }
    
    user.value = null;
    localStorage.removeItem('auth_user');
  }

  return {
    user,
    loading,
    isAuthenticated,
    needsRegistration,
    loginWithGoogle,
    handleCallback,
    loadFromStorage,
    completeRegistration,
    logout,
  };
});
