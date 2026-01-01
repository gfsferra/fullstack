/**
 * Interface genérica para resposta de API
 * @interface ApiResponse
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

/**
 * Interface para resposta de erro da API
 * @interface ApiError
 */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

/**
 * Interface para resposta paginada
 * @interface PaginatedResponse
 */
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Interface para resposta de registro completo
 * @interface RegistrationResponse
 */
export interface RegistrationResponse {
  success: boolean;
  message: string;
  user?: import('../models/User').User;
}

