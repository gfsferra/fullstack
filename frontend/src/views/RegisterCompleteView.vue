<script setup lang="ts">

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import type { UserRegistrationComplete } from '@/types';
import api from '@/services/api';

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
 * Define o formulário de cadastro
 * @function form
 * @returns {Object} Formulário de cadastro
 */
const form = ref({
  name: authStore.user?.name || '',
  birth_date: '',
  cpf: '',
});

/**
 * Define o estado de carregamento
 * @function loading
 * @returns {boolean} Estado de carregamento
 */
const loading = ref(false);

/**
 * Define os erros de validação
 * @function errors
 * @returns {Array} Erros de validação
 */
const errors = ref<string[]>([]);

/**
 * Monta o componente
 * @function onMounted
 * @returns {void}
 */
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/');
  }
  if (authStore.user?.registration_completed) {
    router.push('/users');
  }
});

/**
 * Formata a data de nascimento
 * @function formatDate
 * @param {Event} event - Evento de input
 * @returns {void}
 */
function formatDate(event: Event): void {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, '');

  if (value.length > 8) {
    value = value.slice(0, 8);
  }

  if (value.length > 4) {
    value = value.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
  } else if (value.length > 2) {
    value = value.replace(/(\d{2})(\d{1,2})/, '$1/$2');
  }

  form.value.birth_date = value;
}

/**
 * Converte a data de nascimento para ISO
 * @function dateToISO
 * @param {string} date - Data de nascimento
 * @returns {string} Data de nascimento em ISO
 */
function dateToISO(date: string): string {
  if (!date || date.length !== 10) return '';
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
}

/**
 * Formata o CPF
 * @function formatCpf
 * @param {Event} event - Evento de input
 * @returns {void}
 */
function formatCpf(event: Event): void {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, '');

  if (value.length > 11) {
    value = value.slice(0, 11);
  }

  if (value.length > 9) {
    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  } else if (value.length > 6) {
    value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (value.length > 3) {
    value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }

  form.value.cpf = value;
}

/**
 * Gerencia o envio do formulário
 * @function handleSubmit
 * @returns {Promise<void>} Promise
 */
async function handleSubmit(): Promise<void> {
  if (!authStore.user?.id) return;

  loading.value = true;
  errors.value = [];

  try {
    const payload: UserRegistrationComplete = {
      user_id: authStore.user.id,
      name: form.value.name,
      birth_date: dateToISO(form.value.birth_date),
      cpf: form.value.cpf,
    };

    const response = await api.post('/registration/complete', payload);

    if (response.data.success) {
      authStore.user = {
        ...authStore.user,
        name: form.value.name,
        registration_completed: true,
      };
      localStorage.setItem('auth_user', JSON.stringify(authStore.user));

      router.push('/users');
    }
  } catch (e: unknown) {
    const axiosError = e as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
    if (axiosError.response?.data?.errors) {
      errors.value = Object.values(axiosError.response.data.errors).flat();
    } else {
      errors.value = [axiosError.response?.data?.message || 'Erro ao completar cadastro.'];
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="register-complete">
    <div class="register-complete__background" aria-hidden="true">
      <div class="register-complete__gradient" />
    </div>

    <div class="register-complete__container animate-slide-up">
      <div class="register-complete__card card">
        <header class="card__header">
          <h1 class="card__title">Complete seu Cadastro</h1>
          <p class="register-complete__subtitle">
            Precisamos de mais algumas informações para finalizar
          </p>
        </header>

        <form @submit.prevent="handleSubmit" class="register-form">
          <div class="form-group">
            <label for="name" class="required">Nome Completo</label>
            <input id="name" v-model="form.name" type="text" required placeholder="Seu nome completo"
              autocomplete="name" />
          </div>

          <div class="form-group">
            <label for="email">E-mail</label>
            <input id="email" :value="authStore.user?.email" type="email" disabled
              class="register-form__input-disabled" />
            <span class="form-group__hint">
              <svg class="form-group__hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              E-mail vinculado à sua conta Google
            </span>
          </div>

          <div class="form-group">
            <label for="birth_date" class="required">Data de Nascimento</label>
            <input id="birth_date" :value="form.birth_date" @input="formatDate" type="text" required
              placeholder="dd/mm/aaaa" maxlength="10" inputmode="numeric" autocomplete="bday" />
          </div>

          <div class="form-group">
            <label for="cpf" class="required">CPF</label>
            <input id="cpf" :value="form.cpf" @input="formatCpf" type="text" required placeholder="000.000.000-00"
              maxlength="14" inputmode="numeric" />
          </div>

          <Transition name="shake">
            <div v-if="errors.length > 0" class="register-form__errors">
              <div class="register-form__errors-header">
                <svg class="register-form__errors-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Por favor, corrija os seguintes erros:</span>
              </div>
              <ul class="register-form__errors-list">
                <li v-for="(err, index) in errors" :key="index">{{ err }}</li>
              </ul>
            </div>
          </Transition>

          <button type="submit" class="btn btn--primary btn--block btn--lg register-form__submit"
            :class="{ 'btn-loading': loading }" :disabled="loading">
            <span v-if="!loading">Finalizar Cadastro</span>
            <span v-else>Salvando...</span>
          </button>
        </form>
      </div>

      <p class="register-complete__footer">
        <svg class="register-complete__footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Seus dados estão seguros e protegidos
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.register-complete {
  min-height: 100vh;
  @include flex-center;
  padding: $spacing-6;
  position: relative;
  overflow: hidden;

  &__background {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__gradient {
    position: absolute;
    width: 800px;
    height: 800px;
    background: var(--gradient-primary);
    border-radius: 50%;
    filter: blur(150px);
    opacity: 0.1;
    top: -400px;
    left: 50%;
    transform: translateX(-50%);
  }

  &__container {
    width: 100%;
    max-width: 480px;
    position: relative;
    z-index: 1;
  }

  &__card {
    margin-bottom: $spacing-4;
  }

  &__subtitle {
    color: var(--color-subtext);
    font-size: var(--font-size-sm);
    margin-top: $spacing-2;
  }

  &__footer {
    text-align: center;
    font-size: var(--font-size-xs);
    color: var(--color-subtext);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-2;
    margin: 0;
  }

  &__footer-icon {
    width: 14px;
    height: 14px;
  }
}

.register-form {
  @include flex-column;

  &__input-disabled {
    background: var(--bg-secondary);
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__errors {
    background: rgba($color-red-raw, 0.1);
    border: 1px solid var(--color-error);
    border-radius: $border-radius-md;
    padding: $spacing-4;
  }

  &__errors-header {
    color: var(--color-error);
    font-weight: $font-weight-semibold;
    font-size: var(--font-size-sm);
    margin-bottom: $spacing-2;
    display: flex;
    align-items: center;
    gap: $spacing-2;
  }

  &__errors-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  &__errors-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      color: var(--color-error);
      font-size: var(--font-size-sm);
      padding: $spacing-1 0;
      padding-left: $spacing-5;
      position: relative;

      &::before {
        content: '•';
        position: absolute;
        left: $spacing-2;
        color: var(--color-error);
      }
    }
  }

  &__submit {
    margin-top: $spacing-4;
  }
}

.form-group {
  &__hint {
    display: flex;
    align-items: center;
    gap: $spacing-1;
    font-size: var(--font-size-xs);
    color: var(--color-subtext);
    margin-top: $spacing-1;
  }

  &__hint-icon {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }
}

.shake-enter-active {
  animation: shake 0.4s ease-in-out;
}

.shake-leave-active {
  transition: opacity $duration-fast $ease-out;
}

.shake-enter-from,
.shake-leave-to {
  opacity: 0;
}
</style>
