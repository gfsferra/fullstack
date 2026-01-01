<script setup lang="ts">
/**
 * RegisterCompleteView - Página para completar cadastro
 */
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import type { UserRegistrationComplete } from '@/types';
import api from '@/services/api';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  name: authStore.user?.name || '',
  birth_date: '',
  cpf: '',
});

const loading = ref(false);
const error = ref<string | null>(null);

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/');
  }
  if (authStore.user?.registration_completed) {
    router.push('/users');
  }
});

/**
 * Formata data enquanto digita (dd/mm/yyyy)
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
 * Converte data de dd/mm/yyyy para yyyy-mm-dd (ISO)
 */
function dateToISO(date: string): string {
  if (!date || date.length !== 10) return '';
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
}

/**
 * Formata CPF enquanto digita
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
 * Submete formulário de cadastro
 */
async function handleSubmit(): Promise<void> {
  if (!authStore.user?.id) return;

  loading.value = true;
  error.value = null;

  try {
    const payload: UserRegistrationComplete = {
      user_id: authStore.user.id,
      name: form.value.name,
      birth_date: dateToISO(form.value.birth_date),
      cpf: form.value.cpf,
    };

    const response = await api.post('/registration/complete', payload);

    if (response.data.success) {
      // Atualiza store
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
      error.value = Object.values(axiosError.response.data.errors).flat().join(', ');
    } else {
      error.value = axiosError.response?.data?.message || 'Erro ao completar cadastro.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="register-complete">
    <div class="register-complete__card card animate-slide-up">
      <div class="card__header">
        <h1 class="card__title">Complete seu Cadastro</h1>
        <p class="register-complete__subtitle">
          Precisamos de mais algumas informações para finalizar
        </p>
      </div>

      <div class="card__body">
        <form @submit.prevent="handleSubmit" class="register-form">
          <div class="form-group">
            <label for="name">Nome Completo</label>
            <input id="name" v-model="form.name" type="text" required placeholder="Seu nome completo" />
          </div>

          <div class="form-group">
            <label for="email">E-mail</label>
            <input id="email" :value="authStore.user?.email" type="email" disabled />
            <span class="form-group__hint">E-mail da conta Google</span>
          </div>

          <div class="form-group">
            <label for="birth_date">Data de Nascimento</label>
            <input 
              id="birth_date" 
              :value="form.birth_date" 
              @input="formatDate" 
              type="text" 
              required 
              placeholder="dd/mm/aaaa"
              maxlength="10"
            />
          </div>

          <div class="form-group">
            <label for="cpf">CPF</label>
            <input id="cpf" :value="form.cpf" @input="formatCpf" type="text" required placeholder="000.000.000-00"
              maxlength="14" />
          </div>

          <div v-if="error" class="register-form__error">
            {{ error }}
          </div>

          <button type="submit" class="btn btn--primary register-form__submit" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Finalizar Cadastro' }}
          </button>
        </form>
      </div>
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

  &__card {
    width: 100%;
    max-width: 480px;
  }

  &__subtitle {
    color: $color-subtext;
    font-size: $font-size-sm;
    margin-top: $spacing-2;
  }
}

.register-form {
  @include flex-column;
  gap: $spacing-5;

  &__error {
    background: rgba($color-red, 0.1);
    border: 1px solid $color-red;
    color: $color-red;
    padding: $spacing-3 $spacing-4;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
  }

  &__submit {
    width: 100%;
    margin-top: $spacing-4;
  }
}

.form-group {
  @include flex-column;
  gap: $spacing-2;

  &__hint {
    font-size: $font-size-xs;
    color: $color-subtext;
  }
}
</style>
