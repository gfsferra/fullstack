/**
 * Testes unitários para o componente UserFilters
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import UserFilters from '@/components/users/UserFilters.vue';

// Mock do useDebounceFn do VueUse para testes síncronos
vi.mock('@vueuse/core', () => ({
  useDebounceFn: (fn: () => void) => fn,
}));

describe('UserFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renderização', () => {
    it('deve renderizar campos de filtro', () => {
      const wrapper = mount(UserFilters);
      
      expect(wrapper.find('#filter-name').exists()).toBe(true);
      expect(wrapper.find('#filter-cpf').exists()).toBe(true);
    });

    it('deve renderizar labels corretas', () => {
      const wrapper = mount(UserFilters);
      
      const labels = wrapper.findAll('label');
      expect(labels[0].text()).toBe('Nome');
      expect(labels[1].text()).toBe('CPF');
    });

    it('deve ter placeholders nos inputs', () => {
      const wrapper = mount(UserFilters);
      
      expect(wrapper.find('#filter-name').attributes('placeholder')).toBe('Buscar por nome...');
      expect(wrapper.find('#filter-cpf').attributes('placeholder')).toBe('000.000.000-00');
    });

    it('não deve exibir botão limpar inicialmente', () => {
      const wrapper = mount(UserFilters);
      
      expect(wrapper.find('.user-filters__clear').exists()).toBe(false);
    });
  });

  describe('input de nome', () => {
    it('deve emitir evento filter ao digitar', async () => {
      const wrapper = mount(UserFilters);
      
      const input = wrapper.find('#filter-name');
      await input.setValue('João');
      await input.trigger('input');
      
      expect(wrapper.emitted('filter')).toBeTruthy();
    });

    it('deve incluir nome no filtro emitido', async () => {
      const wrapper = mount(UserFilters);
      
      const input = wrapper.find('#filter-name');
      await input.setValue('Maria');
      await input.trigger('input');
      
      const emitted = wrapper.emitted('filter');
      expect(emitted![0][0]).toEqual(expect.objectContaining({ name: 'Maria' }));
    });

    it('deve emitir undefined para nome vazio', async () => {
      const wrapper = mount(UserFilters);
      
      const input = wrapper.find('#filter-name');
      await input.setValue('');
      await input.trigger('input');
      
      const emitted = wrapper.emitted('filter');
      expect(emitted![0][0]).toEqual({ name: undefined, cpf: undefined });
    });
  });

  describe('formatação de CPF', () => {
    it('deve formatar CPF com pontos e traço', async () => {
      const wrapper = mount(UserFilters);
      const input = wrapper.find('#filter-cpf');
      
      // Simula digitação de CPF completo
      await input.setValue('12345678900');
      await input.trigger('input');
      
      await nextTick();
      
      // O valor deve estar formatado
      const inputElement = input.element as HTMLInputElement;
      expect(inputElement.value).toBe('123.456.789-00');
    });

    it('deve formatar CPF parcial corretamente', async () => {
      const wrapper = mount(UserFilters);
      const input = wrapper.find('#filter-cpf');
      
      // Simula digitação de 6 dígitos
      await input.setValue('123456');
      await input.trigger('input');
      
      await nextTick();
      
      const inputElement = input.element as HTMLInputElement;
      expect(inputElement.value).toBe('123.456');
    });

    it('deve limitar CPF a 11 dígitos', async () => {
      const wrapper = mount(UserFilters);
      const input = wrapper.find('#filter-cpf');
      
      await input.setValue('123456789001234');
      await input.trigger('input');
      
      await nextTick();
      
      const inputElement = input.element as HTMLInputElement;
      // Deve estar limitado a 11 dígitos formatados
      expect(inputElement.value).toBe('123.456.789-00');
    });

    it('deve remover caracteres não numéricos', async () => {
      const wrapper = mount(UserFilters);
      const input = wrapper.find('#filter-cpf');
      
      await input.setValue('123abc456');
      await input.trigger('input');
      
      await nextTick();
      
      const inputElement = input.element as HTMLInputElement;
      expect(inputElement.value).toBe('123.456');
    });

    it('deve ter maxlength 14', () => {
      const wrapper = mount(UserFilters);
      const input = wrapper.find('#filter-cpf');
      
      expect(input.attributes('maxlength')).toBe('14');
    });
  });

  describe('botão limpar', () => {
    it('deve aparecer quando há valor em nome', async () => {
      const wrapper = mount(UserFilters);
      
      await wrapper.find('#filter-name').setValue('João');
      await wrapper.find('#filter-name').trigger('input');
      await nextTick();
      
      expect(wrapper.find('.user-filters__clear').exists()).toBe(true);
    });

    it('deve aparecer quando há valor em CPF', async () => {
      const wrapper = mount(UserFilters);
      
      await wrapper.find('#filter-cpf').setValue('123');
      await wrapper.find('#filter-cpf').trigger('input');
      await nextTick();
      
      expect(wrapper.find('.user-filters__clear').exists()).toBe(true);
    });

    it('deve limpar campos ao clicar', async () => {
      const wrapper = mount(UserFilters);
      
      // Preenche campos
      await wrapper.find('#filter-name').setValue('João');
      await wrapper.find('#filter-name').trigger('input');
      await wrapper.find('#filter-cpf').setValue('123');
      await wrapper.find('#filter-cpf').trigger('input');
      await nextTick();
      
      // Clica em limpar
      await wrapper.find('.user-filters__clear').trigger('click');
      await nextTick();
      
      expect((wrapper.find('#filter-name').element as HTMLInputElement).value).toBe('');
      expect((wrapper.find('#filter-cpf').element as HTMLInputElement).value).toBe('');
    });

    it('deve emitir evento clear ao clicar', async () => {
      const wrapper = mount(UserFilters);
      
      await wrapper.find('#filter-name').setValue('João');
      await wrapper.find('#filter-name').trigger('input');
      await nextTick();
      
      await wrapper.find('.user-filters__clear').trigger('click');
      
      expect(wrapper.emitted('clear')).toBeTruthy();
    });

    it('deve ter type="button"', async () => {
      const wrapper = mount(UserFilters);
      
      await wrapper.find('#filter-name').setValue('João');
      await wrapper.find('#filter-name').trigger('input');
      await nextTick();
      
      expect(wrapper.find('.user-filters__clear').attributes('type')).toBe('button');
    });
  });

  describe('estado de loading', () => {
    it('deve adicionar classe is-searching quando loading', async () => {
      const wrapper = mount(UserFilters, {
        props: { loading: true },
      });
      
      await wrapper.find('#filter-name').setValue('João');
      await wrapper.find('#filter-name').trigger('input');
      await nextTick();
      
      expect(wrapper.find('#filter-name').classes()).toContain('is-searching');
    });

    it('deve mostrar spinner quando buscando com valor', async () => {
      const wrapper = mount(UserFilters, {
        props: { loading: true },
      });
      
      await wrapper.find('#filter-name').setValue('João');
      await wrapper.find('#filter-name').trigger('input');
      await nextTick();
      
      expect(wrapper.find('.user-filters__spinner').exists()).toBe(true);
    });

    it('deve mostrar status "Buscando..." quando loading', async () => {
      const wrapper = mount(UserFilters, {
        props: { loading: true },
      });
      
      await wrapper.find('#filter-name').setValue('João');
      await wrapper.find('#filter-name').trigger('input');
      await nextTick();
      
      expect(wrapper.find('.user-filters__status').text()).toBe('Buscando...');
    });

    it('deve desabilitar botão limpar quando loading', async () => {
      const wrapper = mount(UserFilters, {
        props: { loading: true },
      });
      
      await wrapper.find('#filter-name').setValue('João');
      await wrapper.find('#filter-name').trigger('input');
      await nextTick();
      
      expect(wrapper.find('.user-filters__clear').attributes('disabled')).toBeDefined();
    });
  });
});

