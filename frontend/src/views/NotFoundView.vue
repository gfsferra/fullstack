<script setup lang="ts">
/**
 * NotFoundView - Página 404
 */
import { useRouter } from 'vue-router';

const router = useRouter();

function goHome(): void {
  router.push('/');
}
</script>

<template>
  <div class="not-found">
    <div class="not-found__content">
      <span class="not-found__code">404</span>
      <h1 class="not-found__title">Página não encontrada</h1>
      <p class="not-found__message">
        A página que você está procurando não existe ou foi movida.
      </p>
      <button class="btn btn--primary" @click="goHome">
        Voltar ao início
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.not-found {
  min-height: 100vh;
  @include flex-center;

  &__content {
    text-align: center;
  }

  &__code {
    font-size: 8rem;
    font-weight: $font-weight-bold;
    color: $color-overlay;
    line-height: 1;
    display: block;
    margin-bottom: $spacing-4;
  }

  &__title {
    font-size: $font-size-2xl;
    margin-bottom: $spacing-4;
    color: $color-text;
  }

  &__message {
    color: $color-subtext;
    margin-bottom: $spacing-8;
  }
}
</style>
