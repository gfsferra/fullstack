/**
 * Testes unitários para o componente UserList
 */
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import UserList from '@/components/users/UserList.vue';
import type { User } from '@/types';

describe('UserList', () => {
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@example.com',
      birth_date: '1990-05-15',
      cpf: '123.456.789-00',
      registration_completed: true,
      age: 35,
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@example.com',
      birth_date: '1985-10-20',
      cpf: '987.654.321-00',
      registration_completed: true,
      age: 40,
    },
  ];

  describe('lista vazia', () => {
    it('deve exibir mensagem quando não há usuários', () => {
      const wrapper = mount(UserList, {
        props: { users: [] },
      });
      
      expect(wrapper.find('.user-list__empty').exists()).toBe(true);
      expect(wrapper.text()).toContain('Nenhum usuário cadastrado');
    });

    it('deve exibir emoji na mensagem vazia', () => {
      const wrapper = mount(UserList, {
        props: { users: [] },
      });
      
      expect(wrapper.find('.user-list__empty-icon').text()).toBe('👥');
    });

    it('não deve exibir tabela quando não há usuários', () => {
      const wrapper = mount(UserList, {
        props: { users: [] },
      });
      
      expect(wrapper.find('table').exists()).toBe(false);
    });
  });

  describe('lista com usuários', () => {
    it('deve renderizar tabela quando há usuários', () => {
      const wrapper = mount(UserList, {
        props: { users: mockUsers },
      });
      
      expect(wrapper.find('table').exists()).toBe(true);
      expect(wrapper.find('.user-list__empty').exists()).toBe(false);
    });

    it('deve renderizar cabeçalhos da tabela corretamente', () => {
      const wrapper = mount(UserList, {
        props: { users: mockUsers },
      });
      
      const headers = wrapper.findAll('th');
      expect(headers).toHaveLength(5);
      expect(headers[0].text()).toBe('Nome');
      expect(headers[1].text()).toBe('E-mail');
      expect(headers[2].text()).toBe('Nascimento');
      expect(headers[3].text()).toBe('Idade');
      expect(headers[4].text()).toBe('CPF');
    });

    it('deve renderizar uma linha para cada usuário', () => {
      const wrapper = mount(UserList, {
        props: { users: mockUsers },
      });
      
      const rows = wrapper.findAll('tbody tr');
      expect(rows).toHaveLength(2);
    });

    it('deve exibir dados do usuário corretamente', () => {
      const wrapper = mount(UserList, {
        props: { users: mockUsers },
      });
      
      const firstRow = wrapper.findAll('tbody tr')[0];
      expect(firstRow.text()).toContain('João Silva');
      expect(firstRow.text()).toContain('joao@example.com');
      expect(firstRow.text()).toContain('123.456.789-00');
      expect(firstRow.text()).toContain('35');
    });

    it('deve formatar data de nascimento para pt-BR', () => {
      const wrapper = mount(UserList, {
        props: { users: mockUsers },
      });
      
      const firstRow = wrapper.findAll('tbody tr')[0];
      // 1990-05-15 deve ser formatado como data em formato pt-BR
      // O formato exato pode variar dependendo do locale do ambiente
      const dateCell = firstRow.findAll('td')[2];
      expect(dateCell.text()).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('deve exibir "-" quando data de nascimento não existe', () => {
      const usersWithoutDate: User[] = [{
        ...mockUsers[0],
        birth_date: undefined,
      }];
      
      const wrapper = mount(UserList, {
        props: { users: usersWithoutDate },
      });
      
      const cells = wrapper.findAll('tbody td');
      expect(cells[2].text()).toBe('-');
    });

    it('deve exibir "-" quando idade não existe', () => {
      const usersWithoutAge: User[] = [{
        ...mockUsers[0],
        age: undefined,
      }];
      
      const wrapper = mount(UserList, {
        props: { users: usersWithoutAge },
      });
      
      const cells = wrapper.findAll('tbody td');
      expect(cells[3].text()).toBe('-');
    });

    it('deve exibir "-" quando CPF não existe', () => {
      const usersWithoutCpf: User[] = [{
        ...mockUsers[0],
        cpf: undefined,
      }];
      
      const wrapper = mount(UserList, {
        props: { users: usersWithoutCpf },
      });
      
      const cells = wrapper.findAll('tbody td');
      expect(cells[4].text()).toBe('-');
    });

    it('deve ter classe de animação nas linhas', () => {
      const wrapper = mount(UserList, {
        props: { users: mockUsers },
      });
      
      const rows = wrapper.findAll('tbody tr');
      rows.forEach(row => {
        expect(row.classes()).toContain('animate-fade-in');
      });
    });
  });
});

