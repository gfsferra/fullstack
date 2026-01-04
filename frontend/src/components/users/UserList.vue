<script setup lang="ts">
import type { User } from '@/types';

/**
 * Interface para props do componente
 * @interface Props
 * @property {User[]} users - Lista de usuários
 */
interface Props {
  users: User[];
}

/**
 * Define os props do componente
 * @function defineProps
 * @returns {Props} Props do componente
 */
defineProps<Props>();

/**
 * Formata data para exibição no padrão brasileiro
 * @function formatDate
 * @param {string} dateString - Data a ser formatada
 * @returns {string} Data formatada
 */
function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}
</script>

<template>
  <div class="user-list">
    <div v-if="users.length === 0" class="user-list__empty">
      <svg class="user-list__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <h3 class="user-list__empty-title">Nenhum usuário encontrado</h3>
      <p class="user-list__empty-text">
        Os usuários cadastrados aparecerão aqui
      </p>
    </div>

    <div v-else class="user-list__table-wrapper">
      <table class="user-list__table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th class="hide-mobile">Nascimento</th>
            <th>Idade</th>
            <th>CPF</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in users" :key="user.id" class="user-list__row"
            :style="{ animationDelay: `${index * 30}ms` }">
            <td>
              <div class="user-list__user-cell">
                <img v-if="user.avatar" :src="user.avatar" :alt="user.name"
                  class="user-list__avatar user-list__avatar--image" referrerpolicy="no-referrer" loading="lazy" />
                <div v-else class="user-list__avatar user-list__avatar--placeholder">
                  {{ user.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <span class="user-list__user-name">{{ user.name }}</span>
              </div>
            </td>
            <td>
              <span class="user-list__email">{{ user.email }}</span>
            </td>
            <td class="hide-mobile">{{ formatDate(user.birth_date) }}</td>
            <td>
              <span class="user-list__age">{{ user.age ?? '—' }}</span>
            </td>
            <td>
              <code class="user-list__cpf">{{ user.cpf || '—' }}</code>
            </td>
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
    padding: $spacing-16 $spacing-6;
  }

  &__empty-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto $spacing-4;
    color: var(--color-subtext);
    opacity: 0.5;
  }

  &__empty-title {
    font-size: var(--font-size-xl);
    color: var(--color-text);
    margin-bottom: $spacing-2;
  }

  &__empty-text {
    font-size: var(--font-size-sm);
    color: var(--color-subtext);
    margin: 0;
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
      border-bottom: 1px solid var(--border-color);
    }

    th {
      font-size: var(--font-size-xs);
      font-weight: $font-weight-semibold;
      color: var(--color-subtext);
      text-transform: uppercase;
      letter-spacing: $letter-spacing-wider;
      background: var(--bg-secondary);
      position: sticky;
      top: 0;
      z-index: 1;
    }

    td {
      font-size: var(--font-size-sm);
      color: var(--color-text);
    }
  }

  &__row {
    animation: fadeInUp $duration-normal $ease-out forwards;
    opacity: 0;
    @include transition(background-color, $duration-fast);

    @include hover-supported {
      &:hover {
        background: var(--bg-hover);
      }
    }
  }

  &__user-cell {
    display: flex;
    align-items: center;
    gap: $spacing-3;
  }

  &__avatar {
    width: 36px;
    height: 36px;
    border-radius: $border-radius-full;
    flex-shrink: 0;

    &--image {
      object-fit: cover;
      border: 2px solid var(--border-color);
    }

    &--placeholder {
      background: var(--gradient-primary);
      color: $color-base-raw;
      font-weight: $font-weight-bold;
      font-size: var(--font-size-sm);
      @include flex-center;
    }
  }

  &__user-name {
    font-weight: $font-weight-medium;
    @include truncate;
    max-width: 200px;
  }

  &__email {
    color: var(--color-subtext);
    @include truncate;
    max-width: 250px;
    display: block;
  }

  &__age {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    padding: $spacing-1 $spacing-2;
    background: var(--bg-card);
    border-radius: $border-radius-full;
    font-size: var(--font-size-xs);
    font-weight: $font-weight-medium;
  }

  &__cpf {
    font-family: $font-primary;
    font-size: var(--font-size-xs);
    color: var(--color-mauve);
    background: transparent;
    padding: 0;
  }
}

.hide-mobile {
  @include mobile {
    display: none;
  }
}
</style>
