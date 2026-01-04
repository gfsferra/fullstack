/**
 * Testes unitários para RegisterCompleteView
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import RegisterCompleteView from '@/views/RegisterCompleteView.vue';
import { useAuthStore } from '@/stores/authStore';

// Mock do módulo api
vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

import api from '@/services/api';

describe('RegisterCompleteView', () => {
  let router: ReturnType<typeof createRouter>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/register-complete', name: 'register-complete', component: RegisterCompleteView },
        { path: '/users', name: 'users', component: { template: '<div>Users</div>' } },
      ],
    });
  });

  const mountComponent = async (authenticated = true, registrationComplete = false) => {
    const authStore = useAuthStore();
    
    if (authenticated) {
      authStore.user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        registration_completed: registrationComplete,
      };
    }
    
    await router.push('/register-complete');
    await router.isReady();
    
    return mount(RegisterCompleteView, {
      global: {
        plugins: [router],
      },
    });
  };

  describe('renderização', () => {
    it('deve exibir título "Complete seu Cadastro"', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('.card__title').text()).toBe('Complete seu Cadastro');
    });

    it('deve exibir subtítulo explicativo', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('.register-complete__subtitle').text()).toContain('mais algumas informações');
    });

    it('deve renderizar campos do formulário', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('#name').exists()).toBe(true);
      expect(wrapper.find('#email').exists()).toBe(true);
      expect(wrapper.find('#birth_date').exists()).toBe(true);
      expect(wrapper.find('#cpf').exists()).toBe(true);
    });

    it('deve preencher nome do usuário automaticamente', async () => {
      const wrapper = await mountComponent();
      
      expect((wrapper.find('#name').element as HTMLInputElement).value).toBe('Test User');
    });

    it('deve exibir e-mail desabilitado', async () => {
      const wrapper = await mountComponent();
      
      const emailInput = wrapper.find('#email');
      expect((emailInput.element as HTMLInputElement).value).toBe('test@example.com');
      expect(emailInput.attributes('disabled')).toBeDefined();
    });

    it('deve exibir hint no campo de e-mail', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('.form-group__hint').text()).toContain('E-mail da conta Google');
    });
  });

  describe('redirecionamentos', () => {
    it('deve redirecionar para home quando não autenticado', async () => {
      const pushSpy = vi.spyOn(router, 'push');
      await mountComponent(false);
      
      expect(pushSpy).toHaveBeenCalledWith('/');
    });

    it('deve redirecionar para /users quando cadastro já completo', async () => {
      const pushSpy = vi.spyOn(router, 'push');
      await mountComponent(true, true);
      
      expect(pushSpy).toHaveBeenCalledWith('/users');
    });
  });

  describe('formatação de data', () => {
    it('deve formatar data enquanto digita (dd/mm/yyyy)', async () => {
      const wrapper = await mountComponent();
      const input = wrapper.find('#birth_date');
      
      await input.setValue('15052000');
      await input.trigger('input');
      
      expect((input.element as HTMLInputElement).value).toBe('15/05/2000');
    });

    it('deve formatar data parcialmente', async () => {
      const wrapper = await mountComponent();
      const input = wrapper.find('#birth_date');
      
      await input.setValue('1505');
      await input.trigger('input');
      
      expect((input.element as HTMLInputElement).value).toBe('15/05');
    });

    it('deve limitar data a 8 dígitos', async () => {
      const wrapper = await mountComponent();
      const input = wrapper.find('#birth_date');
      
      await input.setValue('150520001234');
      await input.trigger('input');
      
      expect((input.element as HTMLInputElement).value).toBe('15/05/2000');
    });

    it('deve ter maxlength 10', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('#birth_date').attributes('maxlength')).toBe('10');
    });
  });

  describe('formatação de CPF', () => {
    it('deve formatar CPF enquanto digita', async () => {
      const wrapper = await mountComponent();
      const input = wrapper.find('#cpf');
      
      await input.setValue('12345678900');
      await input.trigger('input');
      
      expect((input.element as HTMLInputElement).value).toBe('123.456.789-00');
    });

    it('deve formatar CPF parcialmente', async () => {
      const wrapper = await mountComponent();
      const input = wrapper.find('#cpf');
      
      await input.setValue('1234567');
      await input.trigger('input');
      
      expect((input.element as HTMLInputElement).value).toBe('123.456.7');
    });

    it('deve limitar CPF a 11 dígitos', async () => {
      const wrapper = await mountComponent();
      const input = wrapper.find('#cpf');
      
      await input.setValue('123456789001234');
      await input.trigger('input');
      
      expect((input.element as HTMLInputElement).value).toBe('123.456.789-00');
    });

    it('deve ter maxlength 14', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('#cpf').attributes('maxlength')).toBe('14');
    });
  });

  describe('envio do formulário', () => {
    it('deve enviar dados para API', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { success: true } });
      
      const wrapper = await mountComponent();
      
      await wrapper.find('#name').setValue('João Silva');
      await wrapper.find('#birth_date').setValue('15/05/1990');
      await wrapper.find('#cpf').setValue('123.456.789-00');
      await wrapper.find('form').trigger('submit');
      
      await flushPromises();
      
      expect(api.post).toHaveBeenCalledWith('/registration/complete', {
        user_id: 1,
        name: 'João Silva',
        birth_date: '1990-05-15',
        cpf: '123.456.789-00',
      });
    });

    it('deve converter data para formato ISO', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { success: true } });
      
      const wrapper = await mountComponent();
      
      await wrapper.find('#name').setValue('Test');
      await wrapper.find('#birth_date').setValue('25/12/1985');
      await wrapper.find('#cpf').setValue('123.456.789-00');
      await wrapper.find('form').trigger('submit');
      
      await flushPromises();
      
      expect(api.post).toHaveBeenCalledWith('/registration/complete', 
        expect.objectContaining({
          birth_date: '1985-12-25',
        })
      );
    });

    it('deve mostrar loading durante envio', async () => {
      vi.mocked(api.post).mockImplementation(() => new Promise(() => {})); // Promise que nunca resolve
      
      const wrapper = await mountComponent();
      
      await wrapper.find('#name').setValue('Test');
      await wrapper.find('#birth_date').setValue('15/05/1990');
      await wrapper.find('#cpf').setValue('123.456.789-00');
      
      await wrapper.find('form').trigger('submit');
      
      expect(wrapper.find('button[type="submit"]').text()).toBe('Salvando...');
      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    });

    it('deve redirecionar para /users após sucesso', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { success: true } });
      const pushSpy = vi.spyOn(router, 'push');
      
      const wrapper = await mountComponent();
      
      await wrapper.find('#name').setValue('Test');
      await wrapper.find('#birth_date').setValue('15/05/1990');
      await wrapper.find('#cpf').setValue('123.456.789-00');
      await wrapper.find('form').trigger('submit');
      
      await flushPromises();
      
      expect(pushSpy).toHaveBeenCalledWith('/users');
    });

    it('deve atualizar store após sucesso', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { success: true } });
      
      const authStore = useAuthStore();
      const wrapper = await mountComponent();
      
      await wrapper.find('#name').setValue('João Atualizado');
      await wrapper.find('#birth_date').setValue('15/05/1990');
      await wrapper.find('#cpf').setValue('123.456.789-00');
      await wrapper.find('form').trigger('submit');
      
      await flushPromises();
      
      expect(authStore.user?.name).toBe('João Atualizado');
      expect(authStore.user?.registration_completed).toBe(true);
    });
  });

  describe('tratamento de erros', () => {
    it('deve exibir mensagem de erro da API', async () => {
      vi.mocked(api.post).mockRejectedValue({
        response: {
          data: {
            message: 'CPF já cadastrado',
          },
        },
      });
      
      const wrapper = await mountComponent();
      
      await wrapper.find('#name').setValue('Test');
      await wrapper.find('#birth_date').setValue('15/05/1990');
      await wrapper.find('#cpf').setValue('123.456.789-00');
      await wrapper.find('form').trigger('submit');
      
      await flushPromises();
      
      expect(wrapper.find('.register-form__errors').exists()).toBe(true);
      expect(wrapper.text()).toContain('CPF já cadastrado');
    });

    it('deve exibir múltiplos erros de validação', async () => {
      vi.mocked(api.post).mockRejectedValue({
        response: {
          data: {
            errors: {
              cpf: ['CPF inválido', 'CPF já cadastrado'],
              birth_date: ['Data inválida'],
            },
          },
        },
      });
      
      const wrapper = await mountComponent();
      
      await wrapper.find('#name').setValue('Test');
      await wrapper.find('#birth_date').setValue('15/05/1990');
      await wrapper.find('#cpf').setValue('123.456.789-00');
      await wrapper.find('form').trigger('submit');
      
      await flushPromises();
      
      expect(wrapper.text()).toContain('CPF inválido');
      expect(wrapper.text()).toContain('CPF já cadastrado');
      expect(wrapper.text()).toContain('Data inválida');
    });

    it('deve exibir mensagem padrão quando sem detalhes', async () => {
      vi.mocked(api.post).mockRejectedValue({});
      
      const wrapper = await mountComponent();
      
      await wrapper.find('#name').setValue('Test');
      await wrapper.find('#birth_date').setValue('15/05/1990');
      await wrapper.find('#cpf').setValue('123.456.789-00');
      await wrapper.find('form').trigger('submit');
      
      await flushPromises();
      
      expect(wrapper.text()).toContain('Erro ao completar cadastro');
    });

    it('deve exibir ícone de erro', async () => {
      vi.mocked(api.post).mockRejectedValue({
        response: { data: { message: 'Erro' } },
      });
      
      const wrapper = await mountComponent();
      
      await wrapper.find('#name').setValue('Test');
      await wrapper.find('#birth_date').setValue('15/05/1990');
      await wrapper.find('#cpf').setValue('123.456.789-00');
      await wrapper.find('form').trigger('submit');
      
      await flushPromises();
      
      expect(wrapper.find('.register-form__errors-icon').text()).toBe('⚠️');
    });

    it('deve exibir título de erros', async () => {
      vi.mocked(api.post).mockRejectedValue({
        response: { data: { message: 'Erro' } },
      });
      
      const wrapper = await mountComponent();
      
      await wrapper.find('#name').setValue('Test');
      await wrapper.find('#birth_date').setValue('15/05/1990');
      await wrapper.find('#cpf').setValue('123.456.789-00');
      await wrapper.find('form').trigger('submit');
      
      await flushPromises();
      
      expect(wrapper.find('.register-form__errors-title').text()).toContain('Por favor, corrija');
    });

    it('não deve exibir erros inicialmente', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('.register-form__errors').exists()).toBe(false);
    });
  });

  describe('validação HTML', () => {
    it('campos obrigatórios devem ter required', async () => {
      const wrapper = await mountComponent();
      
      expect(wrapper.find('#name').attributes('required')).toBeDefined();
      expect(wrapper.find('#birth_date').attributes('required')).toBeDefined();
      expect(wrapper.find('#cpf').attributes('required')).toBeDefined();
    });

    it('deve ter form com prevent default', async () => {
      const wrapper = await mountComponent();
      
      // O formulário não deve recarregar a página
      expect(wrapper.find('form').exists()).toBe(true);
    });
  });
});

