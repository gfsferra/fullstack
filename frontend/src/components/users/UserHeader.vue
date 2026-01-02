<script setup lang="ts">
/**
 * UserHeader - Cabeçalho da página de usuários
 */
import type { AuthUser } from '@/types';

interface Props {
  user: AuthUser | null;
}

interface Emits {
  (e: 'logout'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<template>
  <header class="user-header">
    <div class="user-header__content">
      <h1 class="user-header__title">
        <span class="user-header__emoji">📋</span>
        Cadastro de Usuários
      </h1>
      
      <div class="user-header__actions">
        <div v-if="user" class="user-header__user-info">
          <img 
            v-if="user.avatar" 
            :src="user.avatar" 
            :alt="user.name" 
            class="user-header__avatar"
            referrerpolicy="no-referrer"
          />
          <span class="user-header__name">{{ user.name }}</span>
          <button class="btn btn--secondary btn--sm" @click="$emit('logout')">
            Sair
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
  background: $bg-secondary;
  border-bottom: 1px solid $border-color;
  padding: $spacing-4 $spacing-6;
  
  &__content {
    max-width: 1200px;
    margin: 0 auto;
    @include flex-between;
    flex-wrap: wrap;
    gap: $spacing-4;
  }
  
  &__title {
    font-size: $font-size-xl;
    color: $color-lavender;
    margin: 0;
    @include flex-center;
    gap: $spacing-2;
  }
  
  &__emoji {
    font-size: 1.5rem;
  }
  
  &__actions {
    @include flex-center;
    gap: $spacing-4;
  }
  
  &__user-info {
    @include flex-center;
    gap: $spacing-3;
  }
  
  &__avatar {
    width: 36px;
    height: 36px;
    border-radius: $border-radius-full;
    object-fit: cover;
  }
  
  &__name {
    color: $color-text;
    font-size: $font-size-sm;
    
    @include mobile {
      display: none;
    }
  }
}
</style>
