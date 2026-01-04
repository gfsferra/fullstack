/**
 * Setup global para testes Vitest
 */
import { config } from '@vue/test-utils';
import { vi } from 'vitest';

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock do location
const locationMock = {
  href: '',
  search: '',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
};

Object.defineProperty(window, 'location', {
  value: locationMock,
  writable: true,
});

// Mock de import.meta.env
vi.stubGlobal('import.meta', {
  env: {
    VITE_API_URL: 'http://localhost:8000/api',
    BASE_URL: '/',
  },
});

// Configuração global do Vue Test Utils
config.global.stubs = {
  // Stub de transições para evitar problemas de async
  transition: false,
  'transition-group': false,
};

// Reset mocks antes de cada teste
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
  locationMock.href = '';
  locationMock.search = '';
});

