<script setup lang="ts">
/**
 * HomeView - Página inicial
 * Exibe tela de boas-vindas e login com Google
 */
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton.vue';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);

// Redireciona se já estiver autenticado
if (isAuthenticated.value) {
  if (authStore.user?.registration_completed) {
    router.push('/users');
  } else {
    router.push('/register-complete');
  }
}
</script>

<template>
  <div class="home">
    <div class="home__content">
      <div class="home__hero">
        <h1 class="home__title">
          <span class="home__emoji">📋</span>
          Cadastro de Usuários
        </h1>
        <p class="home__subtitle">
          Sistema de cadastro com autenticação Google OAuth
        </p>
      </div>

      <div class="home__actions">
        <GoogleLoginButton />

        <p class="home__info">
          Faça login com sua conta Google para acessar o sistema
        </p>
      </div>

      <div class="home__features">
        <div class="feature-card">
          <span class="feature-card__icon">🔐</span>
          <h3 class="feature-card__title">Login Seguro</h3>
          <p class="feature-card__description">
            Autenticação via Google OAuth 2.0
          </p>
        </div>

        <div class="feature-card">
          <span class="feature-card__icon">👥</span>
          <h3 class="feature-card__title">Lista de Usuários</h3>
          <p class="feature-card__description">
            Visualize os usuários cadastrados
          </p>
        </div>

        <div class="feature-card">
          <span class="feature-card__icon">📧</span>
          <h3 class="feature-card__title">Confirmação por E-mail</h3>
          <p class="feature-card__description">
            Notificação automática de cadastro
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @use '@/styles/abstracts/variables' as *;
  @use '@/styles/abstracts/mixins' as *;

.home {
  min-height: 100vh;
  @include flex-center;
  padding: $spacing-8;

  &__content {
    max-width: 800px;
    width: 100%;
    text-align: center;
  }

  &__hero {
    margin-bottom: $spacing-12;
  }

  &__title {
    font-size: $font-size-4xl;
    margin-bottom: $spacing-4;
    color: $color-lavender;

    @include mobile {
      font-size: $font-size-2xl;
    }
  }

  &__emoji {
    display: inline-block;
    margin-right: $spacing-2;
  }

  &__subtitle {
    font-size: $font-size-lg;
    color: $color-subtext;

    @include mobile {
      font-size: $font-size-base;
    }
  }

  &__actions {
    margin-bottom: $spacing-12;
    @include flex-column;
    align-items: center;
    gap: $spacing-4;
  }

  &__info {
    color: $color-subtext;
    font-size: $font-size-sm;
    margin: 0;
  }

  &__features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-6;
  }
}

.feature-card {
  @include card;
  text-align: center;
  transition: $transition;

  &:hover {
    transform: translateY(-4px);
  }

  &__icon {
    font-size: 2.5rem;
    margin-bottom: $spacing-3;
    display: block;
  }

  &__title {
    font-size: $font-size-base;
    color: $color-text;
    margin-bottom: $spacing-2;
  }

  &__description {
    font-size: $font-size-sm;
    color: $color-subtext;
    margin: 0;
  }
}
</style>
