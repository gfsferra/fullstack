<script setup lang="ts">

/**
 * Interface para props do componente
 * @interface Props
 * @property {number} rows - Número de linhas do skeleton
 * @property {number} columns - Número de colunas do skeleton
 */
interface Props {
  rows?: number;
  columns?: number;
}

/**
 * Define os valores padrão para os props do componente
 * @function withDefaults
 * @param {Props} defineProps - Props do componente
 * @returns {Props} Valores padrão para os props do componente
 */
withDefaults(defineProps<Props>(), {
  rows: 5,
  columns: 5
});
</script>

<template>
  <div class="table-skeleton">
    <div class="table-skeleton__header">
      <div v-for="col in columns" :key="`header-${col}`" class="table-skeleton__cell skeleton" />
    </div>

    <div v-for="row in rows" :key="`row-${row}`" class="table-skeleton__row"
      :style="{ animationDelay: `${row * 50}ms` }">
      <div v-for="col in columns" :key="`cell-${row}-${col}`" class="table-skeleton__cell skeleton" :style="{
        width: col === 1 ? '40%' : col === columns ? '60px' : undefined
      }" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.table-skeleton {
  width: 100%;

  &__header {
    display: flex;
    gap: $spacing-4;
    padding: $spacing-3 $spacing-4;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);

    .skeleton {
      height: 12px;
      flex: 1;
    }
  }

  &__row {
    display: flex;
    gap: $spacing-4;
    padding: $spacing-3 $spacing-4;
    border-bottom: 1px solid var(--border-color);
    animation: fadeIn $duration-normal $ease-out forwards;
    opacity: 0;

    &:last-child {
      border-bottom: none;
    }
  }

  &__cell {
    flex: 1;
    height: 16px;

    &.skeleton {
      @include skeleton-loader;
    }
  }
}
</style>
