<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton.vue';

/**
 * Define o router
 * @function useRouter
 * @returns {Router} Router
 */
const router = useRouter();

/**
 * Define o store de autenticação
 * @function useAuthStore
 * @returns {AuthStore} Store de autenticação
 */
const authStore = useAuthStore();

/**
 * Define se o usuário está autenticado
 * @function isAuthenticated
 * @returns {boolean} Se o usuário está autenticado
 */
const isAuthenticated = computed(() => authStore.isAuthenticated);

/**
 * Redireciona o usuário para a página de usuários ou de registro completo
 * @function redirectUser
 * @returns {void}
 */
if (isAuthenticated.value) {
  if (authStore.user?.registration_completed) {
    router.push('/users');
  } else {
    router.push('/register-complete');
  }
}

/**
 * Define as features do sistema
 * @function features
 * @returns {Array} Features do sistema
 */
const features = [
  {
    icon: 'shield',
    title: 'Login Seguro',
    description: 'Autenticação via Google OAuth 2.0'
  },
  {
    icon: 'users',
    title: 'Gestão de Usuários',
    description: 'Lista paginada com filtros avançados'
  },
  {
    icon: 'mail',
    title: 'Notificações',
    description: 'Confirmação automática por e-mail'
  }
];
</script>

<template>
  <div class="home">
    <div class="home__background" aria-hidden="true">
      <div class="home__gradient home__gradient--1" />
      <div class="home__gradient home__gradient--2" />
    </div>

    <div class="home__content">
      <header class="home__hero">
        <span class="home__badge animate-fade-in">Sistema de Cadastro</span>

        <h1 class="home__title animate-slide-up">
          <span class="home__title-text">
            Cadastro de<br />
            <span class="text-gradient-primary">Usuários</span>
          </span>
        </h1>

        <p class="home__subtitle animate-slide-up animate-delay-100">
          Autenticação segura com Google OAuth 2.0
        </p>
      </header>

      <div class="home__actions animate-slide-up animate-delay-200">
        <GoogleLoginButton />

        <p class="home__info">
          Faça login com sua conta Google para acessar
        </p>
      </div>

      <div class="home__features">
        <article v-for="(feature, index) in features" :key="feature.title" class="feature-card animate-slide-up"
          :style="{ animationDelay: `${200 + (index * 100)}ms` }">
          <div class="feature-card__icon-wrapper">
            <svg v-if="feature.icon === 'shield'" class="feature-card__icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <svg v-else-if="feature.icon === 'users'" class="feature-card__icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <svg v-else-if="feature.icon === 'mail'" class="feature-card__icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h3 class="feature-card__title">{{ feature.title }}</h3>
          <p class="feature-card__description">{{ feature.description }}</p>
        </article>
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
  position: relative;
  overflow: hidden;

  &__background {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  &__gradient {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.15;

    &--1 {
      width: 600px;
      height: 600px;
      background: var(--color-lavender);
      top: -200px;
      right: -200px;
      animation: float 20s ease-in-out infinite;
    }

    &--2 {
      width: 500px;
      height: 500px;
      background: var(--color-mauve);
      bottom: -150px;
      left: -150px;
      animation: float 25s ease-in-out infinite reverse;
    }
  }

  &__content {
    max-width: 900px;
    width: 100%;
    text-align: center;
    position: relative;
    z-index: 1;
  }

  &__hero {
    margin-bottom: $spacing-10;
  }

  &__badge {
    display: inline-block;
    padding: $spacing-1-5 $spacing-4;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: $border-radius-full;
    font-size: var(--font-size-xs);
    font-weight: $font-weight-medium;
    color: var(--color-subtext);
    letter-spacing: $letter-spacing-wide;
    text-transform: uppercase;
    margin-bottom: $spacing-6;
  }

  &__title {
    font-size: var(--font-size-5xl);
    font-weight: $font-weight-bold;
    line-height: 1.1;
    margin-bottom: $spacing-4;

    @include mobile {
      font-size: var(--font-size-3xl);
    }
  }

  &__title-text {
    display: block;
  }

  &__subtitle {
    font-size: var(--font-size-lg);
    color: var(--color-subtext);
    margin: 0;
    max-width: 500px;
    margin-inline: auto;

    @include mobile {
      font-size: var(--font-size-base);
    }
  }

  &__actions {
    margin-bottom: $spacing-12;
    @include flex-column;
    align-items: center;
    gap: $spacing-4;
  }

  &__info {
    color: var(--color-subtext);
    font-size: var(--font-size-sm);
    margin: 0;
  }

  &__features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: $spacing-6;
  }
}

.feature-card {
  @include card;
  text-align: center;
  @include transition(all, $duration-normal, $ease-bounce);
  cursor: default;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 1px;
    background: var(--gradient-primary);
    border-radius: inherit;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: xor;
    opacity: 0;
    @include transition(opacity);
  }

  @include hover-supported {
    &:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-xl);

      &::before {
        opacity: 1;
      }

      .feature-card__icon-wrapper {
        transform: scale(1.1);
        box-shadow: var(--shadow-glow);
      }
    }
  }

  &__icon-wrapper {
    width: 72px;
    height: 72px;
    margin: 0 auto $spacing-4;
    @include flex-center;
    background: var(--gradient-primary);
    border-radius: $border-radius-xl;
    @include transition(all, $duration-normal, $ease-bounce);
  }

  &__icon {
    width: 32px;
    height: 32px;
    color: $color-base-raw;
  }

  &__title {
    font-size: var(--font-size-lg);
    font-weight: $font-weight-semibold;
    color: var(--color-text);
    margin-bottom: $spacing-2;
  }

  &__description {
    font-size: var(--font-size-sm);
    color: var(--color-subtext);
    margin: 0;
    line-height: $line-height-relaxed;
  }
}
</style>
