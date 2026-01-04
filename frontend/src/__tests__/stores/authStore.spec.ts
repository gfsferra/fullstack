import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/authStore';
import type { AuthUser } from '@/types';

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
  });

  describe('estado inicial', () => {
    it('DADO QUE o store foi inicializado, QUANDO acessar user, ENTÃO deve ser null', () => {
      const store = useAuthStore();
      expect(store.user).toBeNull();
    });

    it('DADO QUE o store foi inicializado, QUANDO acessar loading, ENTÃO deve ser false', () => {
      const store = useAuthStore();
      expect(store.loading).toBe(false);
    });

    it('DADO QUE o store foi inicializado, QUANDO acessar error, ENTÃO deve ser null', () => {
      const store = useAuthStore();
      expect(store.error).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('DADO QUE user é null, QUANDO verificar isAuthenticated, ENTÃO deve retornar false', () => {
      const store = useAuthStore();
      expect(store.isAuthenticated).toBe(false);
    });

    it('DADO QUE user está definido, QUANDO verificar isAuthenticated, ENTÃO deve retornar true', () => {
      const store = useAuthStore();
      const mockUser: AuthUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        registration_completed: true,
      };
      store.setUser(mockUser);
      expect(store.isAuthenticated).toBe(true);
    });
  });

  describe('isRegistrationComplete', () => {
    it('DADO QUE user é null, QUANDO verificar isRegistrationComplete, ENTÃO deve retornar false', () => {
      const store = useAuthStore();
      expect(store.isRegistrationComplete).toBe(false);
    });

    it('DADO QUE user tem registration_completed false, QUANDO verificar isRegistrationComplete, ENTÃO deve retornar false', () => {
      const store = useAuthStore();
      const mockUser: AuthUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        registration_completed: false,
      };
      store.setUser(mockUser);
      expect(store.isRegistrationComplete).toBe(false);
    });

    it('DADO QUE user tem registration_completed true, QUANDO verificar isRegistrationComplete, ENTÃO deve retornar true', () => {
      const store = useAuthStore();
      const mockUser: AuthUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        registration_completed: true,
      };
      store.setUser(mockUser);
      expect(store.isRegistrationComplete).toBe(true);
    });
  });

  describe('needsRegistration', () => {
    it('DADO QUE o usuário não está autenticado, QUANDO verificar needsRegistration, ENTÃO deve retornar false', () => {
      const store = useAuthStore();
      expect(store.needsRegistration).toBe(false);
    });

    it('DADO QUE o usuário está autenticado com cadastro incompleto, QUANDO verificar needsRegistration, ENTÃO deve retornar true', () => {
      const store = useAuthStore();
      const mockUser: AuthUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        registration_completed: false,
      };
      store.setUser(mockUser);
      expect(store.needsRegistration).toBe(true);
    });

    it('DADO QUE o usuário está autenticado com cadastro completo, QUANDO verificar needsRegistration, ENTÃO deve retornar false', () => {
      const store = useAuthStore();
      const mockUser: AuthUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        registration_completed: true,
      };
      store.setUser(mockUser);
      expect(store.needsRegistration).toBe(false);
    });
  });

  describe('setUser', () => {
    it('DADO QUE um usuário válido é fornecido, QUANDO chamar setUser, ENTÃO deve definir o usuário no state', () => {
      const store = useAuthStore();
      const mockUser: AuthUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        registration_completed: true,
      };
      
      store.setUser(mockUser);
      
      expect(store.user).toEqual(mockUser);
    });

    it('DADO QUE um usuário válido é fornecido, QUANDO chamar setUser, ENTÃO deve salvar no localStorage', () => {
      const store = useAuthStore();
      const mockUser: AuthUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        registration_completed: true,
      };
      
      store.setUser(mockUser);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'auth_user',
        JSON.stringify(mockUser)
      );
    });
  });

  describe('loadFromStorage', () => {
    it('DADO QUE existe usuário válido no localStorage, QUANDO inicializar o store, ENTÃO deve carregar o usuário', () => {
      const mockUser: AuthUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        registration_completed: true,
      };
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockUser));
      
      setActivePinia(createPinia());
      const store = useAuthStore();
      
      expect(store.user).toEqual(mockUser);
    });

    it('DADO QUE existe JSON inválido no localStorage, QUANDO inicializar o store, ENTÃO deve limpar localStorage e manter user null', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid-json');
      
      setActivePinia(createPinia());
      const store = useAuthStore();
      
      expect(store.user).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
    });

    it('DADO QUE o localStorage está vazio, QUANDO inicializar o store, ENTÃO deve manter user null', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      
      setActivePinia(createPinia());
      const store = useAuthStore();
      
      expect(store.user).toBeNull();
    });
  });

  describe('logout', () => {
    it('DADO QUE o usuário está autenticado, QUANDO chamar logout, ENTÃO deve limpar o usuário do state', () => {
      const store = useAuthStore();
      const mockUser: AuthUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        registration_completed: true,
      };
      store.setUser(mockUser);
      
      store.logout();
      
      expect(store.user).toBeNull();
    });

    it('DADO QUE o usuário está autenticado, QUANDO chamar logout, ENTÃO deve remover do localStorage', () => {
      const store = useAuthStore();
      const mockUser: AuthUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        registration_completed: true,
      };
      store.setUser(mockUser);
      
      store.logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
    });

    it('DADO QUE qualquer estado do store, QUANDO chamar logout, ENTÃO deve redirecionar para home', () => {
      const store = useAuthStore();
      
      store.logout();
      
      expect(window.location.href).toBe('/');
    });
  });

  describe('loginWithGoogle', () => {
    it('DADO QUE qualquer estado do store, QUANDO chamar loginWithGoogle, ENTÃO deve definir loading como true', () => {
      const store = useAuthStore();
      
      store.loginWithGoogle();
      
      expect(store.loading).toBe(true);
    });

    it('DADO QUE existe error no state, QUANDO chamar loginWithGoogle, ENTÃO deve limpar error', () => {
      const store = useAuthStore();
      store.error = 'Previous error';
      
      store.loginWithGoogle();
      
      expect(store.error).toBeNull();
    });

    it('DADO QUE qualquer estado do store, QUANDO chamar loginWithGoogle, ENTÃO deve redirecionar para URL do Google OAuth', () => {
      const store = useAuthStore();
      
      store.loginWithGoogle();
      
      expect(window.location.href).toContain('/auth/google/redirect');
    });
  });

  describe('getState', () => {
    it('DADO QUE o store possui dados, QUANDO chamar getState, ENTÃO deve retornar o estado completo', () => {
      const store = useAuthStore();
      const mockUser: AuthUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        registration_completed: true,
      };
      store.setUser(mockUser);
      store.loading = true;
      store.error = 'Some error';
      
      const state = store.getState();
      
      expect(state).toEqual({
        user: mockUser,
        loading: true,
        error: 'Some error',
      });
    });
  });
});
