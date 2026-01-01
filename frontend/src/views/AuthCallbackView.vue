<script setup lang="ts">
/**
 * AuthCallbackView - Processa callback do Google OAuth
 */
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');

  if (success === 'true') {
    const user = {
      id: parseInt(urlParams.get('user_id') || '0'),
      name: urlParams.get('name') || '',
      email: urlParams.get('email') || '',
      avatar: urlParams.get('avatar') || undefined,
      registration_completed: urlParams.get('registration_completed') === 'true',
    };

    authStore.setUser(user);

    // Redireciona baseado no status do cadastro
    if (user.registration_completed) {
      router.push('/users');
    } else {
      router.push('/register-complete');
    }
  } else {
    const error = urlParams.get('error');
    console.error('Auth error:', error);
    router.push('/');
  }
});
</script>

<template>
  <div class="auth-callback">
    <div class="loading-spinner"></div>
    <p>Autenticando...</p>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.auth-callback {
  min-height: 100vh;
  @include flex-center;
  @include flex-column;
  gap: $spacing-4;
  color: $color-subtext;
}
</style>
