<script setup lang="ts">
/**
 * UserPagination - Componente de paginação
 */
interface Props {
  currentPage: number;
  lastPage: number;
  total: number;
}

interface Emits {
  (e: 'previous'): void;
  (e: 'next'): void;
  (e: 'goto', page: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/**
 * Gera array de páginas para exibição
 * Mostra no máximo 5 páginas ao redor da página atual
 */
function getVisiblePages(): number[] {
  const pages: number[] = [];
  const maxVisible = 5;
  
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(props.lastPage, start + maxVisible - 1);
  
  // Ajusta início se necessário
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
}
</script>

<template>
  <div class="pagination" v-if="lastPage > 1">
    <div class="pagination__info">
      Página {{ currentPage }} de {{ lastPage }} ({{ total }} usuários)
    </div>
    
    <div class="pagination__controls">
      <button
        class="pagination__btn"
        :disabled="currentPage <= 1"
        @click="emit('previous')"
      >
        ← Anterior
      </button>
      
      <div class="pagination__pages">
        <button
          v-if="getVisiblePages()[0] > 1"
          class="pagination__page"
          @click="emit('goto', 1)"
        >
          1
        </button>
        
        <span v-if="getVisiblePages()[0] > 2" class="pagination__ellipsis">...</span>
        
        <button
          v-for="page in getVisiblePages()"
          :key="page"
          class="pagination__page"
          :class="{ 'pagination__page--active': page === currentPage }"
          @click="emit('goto', page)"
        >
          {{ page }}
        </button>
        
        <span v-if="getVisiblePages()[getVisiblePages().length - 1] < lastPage - 1" class="pagination__ellipsis">...</span>
        
        <button
          v-if="getVisiblePages()[getVisiblePages().length - 1] < lastPage"
          class="pagination__page"
          @click="emit('goto', lastPage)"
        >
          {{ lastPage }}
        </button>
      </div>
      
      <button
        class="pagination__btn"
        :disabled="currentPage >= lastPage"
        @click="emit('next')"
      >
        Próxima →
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: $spacing-4;
  border-top: 1px solid $border-color;
  flex-wrap: wrap;
  gap: $spacing-4;

  &__info {
    font-size: $font-size-sm;
    color: $color-subtext;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: $spacing-2;
  }

  &__btn {
    padding: $spacing-2 $spacing-4;
    font-size: $font-size-sm;
    background: $bg-secondary;
    border: 1px solid $border-color;
    border-radius: $border-radius-md;
    color: $color-text;
    cursor: pointer;
    transition: $transition;

    &:hover:not(:disabled) {
      background: $color-overlay;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__pages {
    display: flex;
    align-items: center;
    gap: $spacing-1;
  }

  &__page {
    min-width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-sm;
    background: transparent;
    border: 1px solid transparent;
    border-radius: $border-radius-md;
    color: $color-subtext;
    cursor: pointer;
    transition: $transition;

    &:hover {
      background: $color-overlay;
      color: $color-text;
    }

    &--active {
      background: $color-lavender;
      color: $bg-primary;
      font-weight: $font-weight-semibold;

      &:hover {
        background: $color-lavender;
        color: $bg-primary;
      }
    }
  }

  &__ellipsis {
    color: $color-subtext;
    padding: 0 $spacing-2;
  }
}
</style>

