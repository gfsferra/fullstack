import axios, { type AxiosInstance, type AxiosError } from 'axios';

/**
 * Instância configurada do Axios para comunicação com a API
 * @service api
 * @property {string} baseURL - URL base da API
 * @property {number} timeout - Tempo limite da requisição
 * @property {AxiosRequestConfig['headers']} headers - Headers padrão da requisição
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
 * @interceptor request
 * @param {AxiosRequestConfig} config - Configuração da requisição
 * @returns {AxiosRequestConfig} Configuração da requisição
 * @throws {AxiosError} Erro da requisição
 */
api.interceptors.request.use(
  (config) => {
    const authUser = localStorage.getItem('auth_user');
    if (authUser) {
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de respostas
 * @interceptor response
 * @param {AxiosResponse} response - Resposta da requisição
 * @returns {AxiosResponse} Resposta da requisição
 * @throws {AxiosError} Erro da requisição
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;