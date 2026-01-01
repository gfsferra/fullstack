/**
 * Interface para usuário autenticado
 * @interface AuthUser
 */
export interface AuthUser {
  /** ID do usuário */
  id: number;
  /** Nome do usuário */
  name: string;
  /** E-mail do usuário */
  email: string;
  /** URL do avatar */
  avatar?: string;
  /** Se o cadastro está completo */
  registration_completed: boolean;
}

/**
 * Interface para callback de autenticação Google
 * @interface GoogleAuthCallback
 */
export interface GoogleAuthCallback {
  success: boolean;
  user_id?: number;
  name?: string;
  email?: string;
  avatar?: string;
  registration_completed?: boolean;
  error?: string;
}

/**
 * Interface para estado de autenticação
 * @interface AuthState
 */
export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

