<script setup lang="ts">
/**
 * UserList - Lista de usuários
 */
import type { User } from '@/types';

interface Props {
  users: User[];
}

defineProps<Props>();

/**
 * Formata data para exibição
 */
function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}
</script>

<template>
  <div class="user-list">
    <div v-if="users.length === 0" class="user-list__empty">
      <span class="user-list__empty-icon">👥</span>
      <p>Nenhum usuário cadastrado</p>
    </div>

    <div v-else class="user-list__table-wrapper">
      <table class="user-list__table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Nascimento</th>
            <th>Idade</th>
            <th>CPF</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="animate-fade-in">
            <td>
              <div class="user-list__user-cell">
                <span class="user-list__user-name">{{ user.name }}</span>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>{{ formatDate(user.birth_date) }}</td>
            <td>{{ user.age ?? '-' }}</td>
            <td>{{ user.cpf || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.user-list {
  &__empty {
    text-align: center;
    padding: $spacing-12;
    color: $color-subtext;
  }

  &__empty-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: $spacing-4;
    opacity: 0.5;
  }

  &__table-wrapper {
    overflow-x: auto;
    @include scrollbar;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: $spacing-3 $spacing-4;
      text-align: left;
      border-bottom: 1px solid $border-color;
    }

    th {
      font-size: $font-size-xs;
      font-weight: $font-weight-semibold;
      color: $color-subtext;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: $bg-secondary;
    }

    td {
      font-size: $font-size-sm;
      color: $color-text;
    }

    tbody tr {
      transition: $transition;

      &:hover {
        background: rgba($color-overlay, 0.5);
      }
    }
  }

  &__user-cell {
    @include flex-center;
    justify-content: flex-start;
    gap: $spacing-3;
  }

  &__user-name {
    font-weight: $font-weight-medium;
  }
}
</style>
