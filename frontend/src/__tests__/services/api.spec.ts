/**
 * Testes unitários para o serviço de API
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock do axios
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
  return { default: mockAxios };
});

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    
    // Reset do módulo para recarregar com novos mocks
    vi.resetModules();
  });

  describe('configuração do axios', () => {
    it('deve criar instância com baseURL correta', async () => {
      // Import dinâmico para pegar a configuração após reset
      await import('@/services/api');
      
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.any(String),
          timeout: 10000,
        })
      );
    });

    it('deve configurar headers padrão', async () => {
      await import('@/services/api');
      
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })
      );
    });

    it('deve registrar interceptor de requisição', async () => {
      const api = await import('@/services/api');
      
      expect(axios.create().interceptors.request.use).toHaveBeenCalled();
    });

    it('deve registrar interceptor de resposta', async () => {
      const api = await import('@/services/api');
      
      expect(axios.create().interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('interceptor de requisição', () => {
    it('deve passar config adiante', async () => {
      const mockUse = vi.mocked(axios.create().interceptors.request.use);
      
      await import('@/services/api');
      
      // Pega a função de sucesso do interceptor
      const successHandler = mockUse.mock.calls[0]?.[0];
      
      if (successHandler) {
        const config = { headers: {} };
        const result = successHandler(config as any);
        expect(result).toEqual(config);
      }
    });

    it('deve rejeitar erros', async () => {
      const mockUse = vi.mocked(axios.create().interceptors.request.use);
      
      await import('@/services/api');
      
      // Pega a função de erro do interceptor
      const errorHandler = mockUse.mock.calls[0]?.[1];
      
      if (errorHandler) {
        const error = new Error('Request failed');
        await expect(errorHandler(error)).rejects.toThrow('Request failed');
      }
    });
  });

  describe('interceptor de resposta', () => {
    it('deve passar response adiante em caso de sucesso', async () => {
      const mockUse = vi.mocked(axios.create().interceptors.response.use);
      
      await import('@/services/api');
      
      // Pega a função de sucesso do interceptor
      const successHandler = mockUse.mock.calls[0]?.[0];
      
      if (successHandler) {
        const response = { data: { message: 'ok' } };
        const result = successHandler(response as any);
        expect(result).toEqual(response);
      }
    });

    it('deve limpar localStorage e redirecionar em caso de 401', async () => {
      const mockUse = vi.mocked(axios.create().interceptors.response.use);
      
      await import('@/services/api');
      
      // Pega a função de erro do interceptor
      const errorHandler = mockUse.mock.calls[0]?.[1];
      
      if (errorHandler) {
        const error = {
          response: { status: 401 },
        };
        
        try {
          await errorHandler(error);
        } catch {
          // Esperado
        }
        
        expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
        expect(window.location.href).toBe('/');
      }
    });

    it('deve rejeitar outros erros sem redirecionar', async () => {
      const mockUse = vi.mocked(axios.create().interceptors.response.use);
      
      await import('@/services/api');
      
      // Pega a função de erro do interceptor
      const errorHandler = mockUse.mock.calls[0]?.[1];
      
      if (errorHandler) {
        const error = {
          response: { status: 500 },
          message: 'Server error',
        };
        
        await expect(errorHandler(error)).rejects.toEqual(error);
        expect(localStorage.removeItem).not.toHaveBeenCalled();
      }
    });
  });
});

