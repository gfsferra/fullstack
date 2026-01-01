<script setup lang="ts">
/**
 * App.vue - Componente raiz da aplicação
 * Renderiza o RouterView para navegação entre páginas
 */
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

onMounted(() => {
  // Carrega usuário do localStorage se existir
  authStore.loadFromStorage();
});
</script>

<template>
  <div id="app">
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>
</template>

<style lang="scss">
#app {
  min-height: 100vh;
}

.fade-enter-active,
.fade-leave-active {
  transition: all ease-in-out 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
