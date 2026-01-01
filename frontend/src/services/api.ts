import axios, { type AxiosInstance, type AxiosError } from 'axios';

/**
 * Instância configurada do Axios para comunicação com a API
 */
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Interceptor de requisições
 * Adiciona token de autenticação se disponível
 */
api.interceptors.request.use(
  (config) => {
    const authUser = localStorage.getItem('auth_user');
    if (authUser) {
      // Pode adicionar token aqui se necessário
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de respostas
 * Trata erros globais
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Limpa storage e redireciona para login
      localStorage.removeItem('auth_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
