/**
 * Testes unitários para o componente UserPagination
 */
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import UserPagination from '@/components/users/UserPagination.vue';

describe('UserPagination', () => {
  const defaultProps = {
    currentPage: 3,
    lastPage: 10,
    total: 150,
  };

  describe('renderização', () => {
    it('não deve renderizar quando há apenas uma página', () => {
      const wrapper = mount(UserPagination, {
        props: {
          currentPage: 1,
          lastPage: 1,
          total: 10,
        },
      });
      
      expect(wrapper.find('.pagination').exists()).toBe(false);
    });

    it('deve renderizar quando há mais de uma página', () => {
      const wrapper = mount(UserPagination, {
        props: defaultProps,
      });
      
      expect(wrapper.find('.pagination').exists()).toBe(true);
    });

    it('deve exibir informações de paginação', () => {
      const wrapper = mount(UserPagination, {
        props: defaultProps,
      });
      
      expect(wrapper.find('.pagination__info').text()).toContain('Página 3 de 10');
      expect(wrapper.find('.pagination__info').text()).toContain('150 usuários');
    });
  });

  describe('botão Anterior', () => {
    it('deve estar desabilitado na primeira página', () => {
      const wrapper = mount(UserPagination, {
        props: {
          currentPage: 1,
          lastPage: 5,
          total: 75,
        },
      });
      
      const prevBtn = wrapper.findAll('.pagination__btn')[0];
      expect(prevBtn.attributes('disabled')).toBeDefined();
    });

    it('deve estar habilitado em páginas > 1', () => {
      const wrapper = mount(UserPagination, {
        props: defaultProps,
      });
      
      const prevBtn = wrapper.findAll('.pagination__btn')[0];
      expect(prevBtn.attributes('disabled')).toBeUndefined();
    });

    it('deve emitir evento previous ao clicar', async () => {
      const wrapper = mount(UserPagination, {
        props: defaultProps,
      });
      
      await wrapper.findAll('.pagination__btn')[0].trigger('click');
      
      expect(wrapper.emitted('previous')).toBeTruthy();
    });
  });

  describe('botão Próxima', () => {
    it('deve estar desabilitado na última página', () => {
      const wrapper = mount(UserPagination, {
        props: {
          currentPage: 5,
          lastPage: 5,
          total: 75,
        },
      });
      
      const nextBtn = wrapper.findAll('.pagination__btn')[1];
      expect(nextBtn.attributes('disabled')).toBeDefined();
    });

    it('deve estar habilitado em páginas < lastPage', () => {
      const wrapper = mount(UserPagination, {
        props: defaultProps,
      });
      
      const nextBtn = wrapper.findAll('.pagination__btn')[1];
      expect(nextBtn.attributes('disabled')).toBeUndefined();
    });

    it('deve emitir evento next ao clicar', async () => {
      const wrapper = mount(UserPagination, {
        props: defaultProps,
      });
      
      await wrapper.findAll('.pagination__btn')[1].trigger('click');
      
      expect(wrapper.emitted('next')).toBeTruthy();
    });
  });

  describe('páginas visíveis', () => {
    it('deve destacar página atual com classe active', () => {
      const wrapper = mount(UserPagination, {
        props: defaultProps,
      });
      
      const activePage = wrapper.find('.pagination__page--active');
      expect(activePage.exists()).toBe(true);
      expect(activePage.text()).toBe('3');
    });

    it('deve emitir evento goto ao clicar em uma página', async () => {
      const wrapper = mount(UserPagination, {
        props: defaultProps,
      });
      
      // Encontra um botão de página que não é a atual
      const pages = wrapper.findAll('.pagination__page');
      const targetPage = pages.find(p => p.text() !== '3');
      
      if (targetPage) {
        await targetPage.trigger('click');
        expect(wrapper.emitted('goto')).toBeTruthy();
      }
    });

    it('deve mostrar primeira página quando não está visível', () => {
      const wrapper = mount(UserPagination, {
        props: {
          currentPage: 8,
          lastPage: 10,
          total: 150,
        },
      });
      
      const pages = wrapper.findAll('.pagination__page');
      expect(pages[0].text()).toBe('1');
    });

    it('deve mostrar última página quando não está visível', () => {
      const wrapper = mount(UserPagination, {
        props: {
          currentPage: 3,
          lastPage: 10,
          total: 150,
        },
      });
      
      const pages = wrapper.findAll('.pagination__page');
      const lastPageBtn = pages[pages.length - 1];
      expect(lastPageBtn.text()).toBe('10');
    });

    it('deve mostrar ellipsis quando há páginas ocultas no início', () => {
      const wrapper = mount(UserPagination, {
        props: {
          currentPage: 8,
          lastPage: 10,
          total: 150,
        },
      });
      
      expect(wrapper.find('.pagination__ellipsis').exists()).toBe(true);
    });

    it('deve mostrar ellipsis quando há páginas ocultas no final', () => {
      const wrapper = mount(UserPagination, {
        props: {
          currentPage: 3,
          lastPage: 15,
          total: 225,
        },
      });
      
      const ellipses = wrapper.findAll('.pagination__ellipsis');
      expect(ellipses.length).toBeGreaterThan(0);
    });
  });

  describe('cenários de borda', () => {
    it('deve funcionar com apenas 2 páginas', () => {
      const wrapper = mount(UserPagination, {
        props: {
          currentPage: 1,
          lastPage: 2,
          total: 30,
        },
      });
      
      const pages = wrapper.findAll('.pagination__page');
      expect(pages).toHaveLength(2);
    });

    it('deve funcionar com 5 ou menos páginas', () => {
      const wrapper = mount(UserPagination, {
        props: {
          currentPage: 3,
          lastPage: 5,
          total: 75,
        },
      });
      
      // Não deve ter ellipsis
      expect(wrapper.find('.pagination__ellipsis').exists()).toBe(false);
    });

    it('deve ir para primeira página ao clicar nela', async () => {
      const wrapper = mount(UserPagination, {
        props: {
          currentPage: 8,
          lastPage: 10,
          total: 150,
        },
      });
      
      const pages = wrapper.findAll('.pagination__page');
      await pages[0].trigger('click');
      
      expect(wrapper.emitted('goto')).toBeTruthy();
      expect(wrapper.emitted('goto')![0]).toEqual([1]);
    });

    it('deve ir para última página ao clicar nela', async () => {
      const wrapper = mount(UserPagination, {
        props: {
          currentPage: 3,
          lastPage: 10,
          total: 150,
        },
      });
      
      const pages = wrapper.findAll('.pagination__page');
      const lastBtn = pages[pages.length - 1];
      await lastBtn.trigger('click');
      
      expect(wrapper.emitted('goto')).toBeTruthy();
      expect(wrapper.emitted('goto')![0]).toEqual([10]);
    });
  });
});

