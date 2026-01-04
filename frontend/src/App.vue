<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

/**
 * Monta o componente
 * @function onMounted
 * @returns {void}
 */
onMounted(() => {
  authStore.loadFromStorage();
});
</script>

<template>
  <div id="app">
    <RouterView v-slot="{ Component, route }">
      <Transition :name="route.meta.transition as string || 'fade'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </div>
</template>

<style lang="scss">
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

#app {
  min-height: 100vh;
  min-height: 100dvh;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity $duration-normal $ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all $duration-normal $ease-out;
}

.slide-fade-leave-active {
  transition: all $duration-fast $ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.scale-enter-active,
.scale-leave-active {
  transition: all $duration-normal $ease-bounce;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
