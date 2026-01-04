<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import type { UserFilters } from '@/stores/userStore';

/**
 * Interface para props do componente
 * @interface Props
 * @property {boolean} loading - Se o componente está carregando
 */
interface Props {
  loading?: boolean;
}

/**
 * Interface para emits do componente
 * @interface Emits
 * @event filter - Evento para filtrar usuários
 * @event clear - Evento para limpar filtros
 */
interface Emits {
  (e: 'filter', filters: UserFilters): void;
  (e: 'clear'): void;
}

/**
 * Define os valores padrão para os props do componente
 * @function withDefaults
 * @param {Props} defineProps - Props do componente
 * @returns {Props} Valores padrão para os props do componente
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

/**
 * Define os emits do componente
 * @function defineEmits
 * @returns {Emits} Emits do componente
 */
const emit = defineEmits<Emits>();

/**
 * Define o nome do usuário
 * @function name
 * @returns {string} Nome do usuário
 */
const name = ref('');

/**
 * Define o CPF do usuário
 * @function cpf
 * @returns {string} CPF do usuário
 */
const cpf = ref('');

/**
 * Define se o usuário está digitando
 * @function isTyping
 * @returns {boolean} Se o usuário está digitando
 */
const isTyping = ref(false);

/**
 * Define se o usuário está buscando
 * @function isSearching
 * @returns {boolean} Se o usuário está buscando
 */
const isSearching = computed(() => isTyping.value || props.loading);

/**
 * Define se o usuário tem filtros
 * @function hasFilters
 * @returns {boolean} Se o usuário tem filtros
 */
const hasFilters = computed(() => Boolean(name.value || cpf.value));

/**
 * Emite o filtro de usuários
 * @function emitFilter
 * @returns {void}
 */
function emitFilter(): void {
  isTyping.value = false;
  emit('filter', {
    name: name.value || undefined,
    cpf: cpf.value || undefined,
  });
}

/**
 * Define o debounce para a busca de usuários
 * @function debouncedFilter
 * @param {Function} emitFilter - Função para emitir o filtro
 * @param {number} delay - Tempo de debounce
 * @returns {Function} Função debounce
 */
const debouncedFilter = useDebounceFn(emitFilter, 400);

/**
 * Triggera a busca de usuários
 * @function triggerSearch
 * @returns {void}
 */
function triggerSearch(): void {
  isTyping.value = true;
  debouncedFilter();
}

/**
 * Evento de input para o nome do usuário
 * @function onNameInput
 * @param {Event} event - Evento de input
 * @returns {void}
 */
function onNameInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  name.value = input.value;
  triggerSearch();
}

/**
 * Formata o CPF do usuário
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

  cpf.value = value;
  triggerSearch();
}

/**
 * Limpa os filtros de usuários
 * @function clearFilters
 * @returns {void}
 */
function clearFilters(): void {
  name.value = '';
  cpf.value = '';
  isTyping.value = false;
  emit('clear');
}
</script>

<template>
  <div class="user-filters">
    <div class="user-filters__fields">
      <div class="user-filters__field">
        <label for="filter-name" class="user-filters__label">
          Nome
        </label>
        <div class="user-filters__input-wrapper">
          <input id="filter-name" :value="name" @input="onNameInput" type="text" placeholder="Buscar por nome..."
            class="user-filters__input" :class="{ 'is-active': name }" autocomplete="off" />
          <span v-if="isSearching && name" class="user-filters__spinner" aria-label="Buscando..." />
        </div>
      </div>

      <div class="user-filters__field">
        <label for="filter-cpf" class="user-filters__label">
          CPF
        </label>
        <div class="user-filters__input-wrapper">
          <input id="filter-cpf" :value="cpf" @input="formatCpf" type="text" placeholder="000.000.000-00" maxlength="14"
            class="user-filters__input" :class="{ 'is-active': cpf }" autocomplete="off" />
          <span v-if="isSearching && cpf" class="user-filters__spinner" aria-label="Buscando..." />
        </div>
      </div>

      <div class="user-filters__actions">
        <Transition name="fade">
          <span v-if="isSearching" class="user-filters__status">
            <span class="user-filters__status-dot" />
            Buscando...
          </span>
        </Transition>

        <Transition name="scale">
          <button v-if="hasFilters" class="btn btn--secondary btn--sm user-filters__clear" @click="clearFilters"
            type="button" :disabled="isSearching">
            <svg class="user-filters__clear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Limpar
          </button>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.user-filters {
  margin-bottom: $spacing-6;
  padding: $spacing-4;
  background: var(--bg-secondary);
  border-radius: $border-radius-lg;
  border: 1px solid var(--border-color);

  &__fields {
    display: flex;
    gap: $spacing-4;
    align-items: flex-end;
    flex-wrap: wrap;

    @include mobile {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__field {
    flex: 1;
    min-width: 200px;
  }

  &__label {
    display: block;
    margin-bottom: $spacing-2;
    font-size: var(--font-size-sm);
    font-weight: $font-weight-medium;
    color: var(--color-subtext);
  }

  &__input-wrapper {
    position: relative;
  }

  &__input {
    width: 100%;
    @include transition(border-color, $duration-fast);

    &.is-active {
      border-color: var(--color-lavender);
    }
  }

  &__spinner {
    position: absolute;
    right: $spacing-3;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: var(--color-lavender);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    flex-shrink: 0;
    height: $input-height;

    @include mobile {
      justify-content: space-between;
    }
  }

  &__status {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    font-size: var(--font-size-sm);
    color: var(--color-lavender);
  }

  &__status-dot {
    width: 8px;
    height: 8px;
    background: var(--color-lavender);
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
  }

  &__clear {
    gap: $spacing-1;
  }

  &__clear-icon {
    width: 14px;
    height: 14px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity $duration-fast $ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all $duration-fast $ease-bounce;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
