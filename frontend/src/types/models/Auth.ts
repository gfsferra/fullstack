/**
 * Interface para usuário autenticado
 * @interface AuthUser
 * @property {number} id - ID do usuário
 * @property {string} name - Nome do usuário
 * @property {string} email - E-mail do usuário
 * @property {string} avatar - URL do avatar
 * @property {boolean} registration_completed - Se o cadastro está completo
 */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  registration_completed: boolean;
}

/**
 * Interface para callback de autenticação Google
 * @interface GoogleAuthCallback
 * @property {boolean} success - Se a autenticação foi bem-sucedida
 * @property {number} user_id - ID do usuário
 * @property {string} name - Nome do usuário
 * @property {string} email - E-mail do usuário
 * @property {string} avatar - URL do avatar
 * @property {boolean} registration_completed - Se o cadastro está completo
 */
export interface GoogleAuthCallback {
  success: boolean;
  user_id?: number;
  name: string;
  email: string;
  avatar: string;
  registration_completed: boolean;
  error?: string;
}

/**
 * Interface para estado de autenticação
 * @interface AuthState
 * @property {AuthUser | null} user - Usuário autenticado
 * @property {boolean} loading - Se está carregando
 * @property {string | null} error - Erro de autenticação ou null
 */
export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

