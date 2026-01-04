<script setup lang="ts">

/**
 * Interface para props do componente
 * @interface Props
 * @property {string} type - Tipo de skeleton
 * @property {string} width - Largura do skeleton
 * @property {string} height - Altura do skeleton
 * @property {number} lines - Número de linhas do skeleton
 * @property {boolean} animate - Se o skeleton deve ser animado
 */
interface Props {
  type?: 'text' | 'title' | 'avatar' | 'avatar-lg' | 'button' | 'input' | 'card' | 'image' | 'circle';
  width?: string;
  height?: string;
  lines?: number;
  animate?: boolean;
}

/**
 * Define os valores padrão para os props do componente
 * @function withDefaults
 * @param {Props} defineProps - Props do componente
 * @returns {Props} Valores padrão para os props do componente
 */
withDefaults(defineProps<Props>(), {
  type: 'text',
  lines: 1,
  animate: true
});
</script>

<template>
  <div v-if="type !== 'text' || lines === 1" class="skeleton" :class="[
    `skeleton--${type}`,
    { 'skeleton--static': !animate }
  ]" :style="{
      width: width,
      height: height
    }" />
  <div v-else class="skeleton-lines">
    <div v-for="i in lines" :key="i" class="skeleton skeleton--text" :class="{ 'skeleton--static': !animate }" :style="{
      width: i === lines ? '70%' : '100%'
    }" />
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.skeleton {
  @include skeleton-loader;

  &--text {
    height: 1em;
    border-radius: $border-radius-sm;
  }

  &--title {
    height: 1.5em;
    width: 60%;
    border-radius: $border-radius-sm;
  }

  &--avatar {
    width: $avatar-size-md;
    height: $avatar-size-md;
    border-radius: $border-radius-full;
  }

  &--avatar-lg {
    width: $avatar-size-xl;
    height: $avatar-size-xl;
    border-radius: $border-radius-full;
  }

  &--button {
    height: $button-height;
    width: 120px;
    border-radius: $button-border-radius;
  }

  &--input {
    height: $input-height;
    border-radius: $input-border-radius;
  }

  &--card {
    height: 200px;
    border-radius: $card-border-radius;
  }

  &--image {
    aspect-ratio: 16 / 9;
    border-radius: $border-radius-md;
  }

  &--circle {
    aspect-ratio: 1;
    border-radius: $border-radius-full;
  }

  &--static {
    animation: none;
    background: var(--bg-card);
  }
}

.skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}
</style>
