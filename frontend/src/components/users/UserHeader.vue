<script setup lang="ts">
import type { AuthUser } from '@/types';

/**
 * Interface para props do componente
 * @interface Props
 * @property {AuthUser | null} user - Usuário autenticado
 */
interface Props {
  user: AuthUser | null;
}

/**
 * Interface para emits do componente
 * @interface Emits
 * @event logout - Evento para logout
 */
interface Emits {
  (e: 'logout'): void;
}

/**
 * Define os props do componente
 * @function defineProps
 * @returns {Props} Props do componente
 */
defineProps<Props>();

/**
 * Define os emits do componente
 * @function defineEmits
 * @returns {Emits} Emits do componente
 */
defineEmits<Emits>();
</script>

<template>
  <header class="user-header">
    <div class="user-header__container">
      <div class="user-header__brand">
        <svg class="user-header__logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <h1 class="user-header__title">Cadastro de Usuários</h1>
      </div>

      <div class="user-header__actions">
        <div v-if="user" class="user-header__user">
          <div class="user-header__avatar-wrapper">
            <img v-if="user.avatar" :src="user.avatar" :alt="user.name" class="user-header__avatar"
              referrerpolicy="no-referrer" loading="lazy" />
            <div v-else class="user-header__avatar user-header__avatar--placeholder">
              {{ user.name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
          </div>

          <div class="user-header__user-info">
            <span class="user-header__name">{{ user.name }}</span>
            <span class="user-header__email">{{ user.email }}</span>
          </div>

          <button class="btn btn--ghost btn--sm" @click="$emit('logout')">
            <svg class="user-header__logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span class="user-header__logout-text">Sair</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.user-header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: $spacing-4 $spacing-6;
  position: sticky;
  top: 0;
  z-index: $z-sticky;
  backdrop-filter: blur(12px);

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    @include flex-between;
    flex-wrap: wrap;
    gap: $spacing-4;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: $spacing-3;
  }

  &__logo {
    width: 28px;
    height: 28px;
    color: var(--color-lavender);
  }

  &__title {
    font-size: var(--font-size-xl);
    font-weight: $font-weight-bold;
    margin: 0;
    @include text-gradient;

    @include mobile {
      font-size: var(--font-size-lg);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $spacing-4;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: $spacing-3;
  }

  &__avatar-wrapper {
    position: relative;
  }

  &__avatar {
    width: $avatar-size-md;
    height: $avatar-size-md;
    border-radius: $border-radius-full;
    object-fit: cover;
    border: 2px solid var(--border-color);
    @include transition(border-color);

    &:hover {
      border-color: var(--color-lavender);
    }

    &--placeholder {
      @include flex-center;
      background: var(--gradient-primary);
      color: $color-base-raw;
      font-weight: $font-weight-bold;
      font-size: var(--font-size-sm);
      border: none;
    }
  }

  &__user-info {
    display: flex;
    flex-direction: column;

    @include mobile {
      display: none;
    }
  }

  &__name {
    font-size: var(--font-size-sm);
    font-weight: $font-weight-medium;
    color: var(--color-text);
    line-height: 1.2;
  }

  &__email {
    font-size: var(--font-size-xs);
    color: var(--color-subtext);
    @include truncate;
    max-width: 180px;
  }

  &__logout-icon {
    width: 18px;
    height: 18px;
    @include transition-transform;
  }

  &__logout-text {
    @include mobile {
      @include visually-hidden;
    }
  }

  .btn:hover &__logout-icon {
    transform: translateX(2px);
  }
}
</style>
