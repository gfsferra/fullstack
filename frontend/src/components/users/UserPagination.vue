<script setup lang="ts">

/**
 * Interface para props do componente
 * @interface Props
 * @property {number} currentPage - Página atual
 * @property {number} lastPage - Última página
 * @property {number} total - Total de usuários
 */
interface Props {
  currentPage: number;
  lastPage: number;
  total: number;
}

/**
 * Interface para emits do componente
 * @interface Emits
 * @event previous - Evento para voltar para a página anterior
 * @event next - Evento para avançar para a próxima página
 * @event goto - Evento para ir para uma página específica
 */
interface Emits {
  (e: 'previous'): void;
  (e: 'next'): void;
  (e: 'goto', page: number): void;
}

/**
 * Define os props do componente
 * @function defineProps
 * @returns {Props} Props do componente
 */
const props = defineProps<Props>();

/**
 * Define os emits do componente
 * @function defineEmits
 * @returns {Emits} Emits do componente
 */
const emit = defineEmits<Emits>();

/**
 * Gera array de páginas para exibição
 * Mostra no máximo 5 páginas ao redor da página atual
 * @function getVisiblePages
 * @returns {number[]} Array de páginas para exibição
 */
function getVisiblePages(): number[] {
  const pages: number[] = [];
  const maxVisible = 5;
  
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(props.lastPage, start + maxVisible - 1);
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
}

/**
 * Calcula o primeiro item da página atual
 * @function startItem
 * @returns {number} Primeiro item da página atual
 */
const startItem = () => (props.currentPage - 1) * 15 + 1;

/**
 * Calcula o último item da página atual
 * @function endItem
 * @returns {number} Último item da página atual
 */
const endItem = () => Math.min(props.currentPage * 15, props.total);
</script>

<template>
  <div class="pagination" v-if="lastPage > 1">
    <div class="pagination__info">
      <span class="pagination__range">
        {{ startItem() }}-{{ endItem() }}
      </span>
      <span class="pagination__total">
        de {{ total }} usuários
      </span>
    </div>
    
    <nav class="pagination__controls" aria-label="Paginação">
      <button
        class="pagination__btn pagination__btn--nav"
        :disabled="currentPage <= 1"
        @click="emit('previous')"
        aria-label="Página anterior"
      >
        <svg class="pagination__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        <span class="pagination__btn-text">Anterior</span>
      </button>
      
      <div class="pagination__pages">
        <button
          v-if="getVisiblePages()[0] > 1"
          class="pagination__page"
          @click="emit('goto', 1)"
          aria-label="Ir para página 1"
        >
          1
        </button>
        
        <span 
          v-if="getVisiblePages()[0] > 2" 
          class="pagination__ellipsis"
          aria-hidden="true"
        >
          ...
        </span>
        
        <button
          v-for="page in getVisiblePages()"
          :key="page"
          class="pagination__page"
          :class="{ 'pagination__page--active': page === currentPage }"
          @click="emit('goto', page)"
          :aria-label="`Ir para página ${page}`"
          :aria-current="page === currentPage ? 'page' : undefined"
        >
          {{ page }}
        </button>
        
        <span 
          v-if="getVisiblePages()[getVisiblePages().length - 1] < lastPage - 1" 
          class="pagination__ellipsis"
          aria-hidden="true"
        >
          ...
        </span>
        
        <button
          v-if="getVisiblePages()[getVisiblePages().length - 1] < lastPage"
          class="pagination__page"
          @click="emit('goto', lastPage)"
          :aria-label="`Ir para página ${lastPage}`"
        >
          {{ lastPage }}
        </button>
      </div>
      
      <button
        class="pagination__btn pagination__btn--nav"
        :disabled="currentPage >= lastPage"
        @click="emit('next')"
        aria-label="Próxima página"
      >
        <span class="pagination__btn-text">Próxima</span>
        <svg class="pagination__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </nav>
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
  margin-top: $spacing-4;
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: $spacing-4;

  &__info {
    font-size: var(--font-size-sm);
    color: var(--color-subtext);
    display: flex;
    gap: $spacing-1;
  }
  
  &__range {
    color: var(--color-text);
    font-weight: $font-weight-medium;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: $spacing-2;
  }

  &__btn {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-4;
    font-size: var(--font-size-sm);
    font-weight: $font-weight-medium;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: $border-radius-md;
    color: var(--color-text);
    cursor: pointer;
    @include transition;
    @include focus-ring;

    @include hover-supported {
      &:hover:not(:disabled) {
        background: var(--bg-card);
        border-color: var(--color-lavender);
        color: var(--color-lavender);
      }
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
  
  &__arrow {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    @include transition-transform;
  }
  
  &__btn:hover:not(:disabled) &__arrow {
    &:first-child { transform: translateX(-2px); }
    &:last-child { transform: translateX(2px); }
  }
  
  &__btn-text {
    @include mobile {
      @include visually-hidden;
    }
  }

  &__pages {
    display: flex;
    align-items: center;
    gap: $spacing-1;
    
    @include mobile {
      display: none;
    }
  }

  &__page {
    min-width: 36px;
    height: 36px;
    @include flex-center;
    font-size: var(--font-size-sm);
    font-weight: $font-weight-medium;
    background: transparent;
    border: 1px solid transparent;
    border-radius: $border-radius-md;
    color: var(--color-subtext);
    cursor: pointer;
    @include transition;
    @include focus-ring;

    @include hover-supported {
      &:hover:not(&--active) {
        background: var(--bg-card);
        color: var(--color-text);
        border-color: var(--border-color);
      }
    }

    &--active {
      background: var(--gradient-primary);
      color: $color-base-raw;
      border-color: transparent;
      font-weight: $font-weight-semibold;
      box-shadow: var(--shadow-sm), var(--shadow-glow);
      
      &:hover {
        background: var(--gradient-primary);
        color: $color-base-raw;
      }
    }
  }

  &__ellipsis {
    color: var(--color-subtext);
    padding: 0 $spacing-1;
    font-size: var(--font-size-sm);
    user-select: none;
  }
}
</style>
