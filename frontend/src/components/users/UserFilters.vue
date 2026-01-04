<script setup lang="ts">
/**
 * UserFilters - Componente de filtros para lista de usuários
 * Implementa debounce com VueUse para otimização de buscas em grandes volumes
 */
import { ref, computed } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import type { UserFilters } from '@/stores/userStore';

interface Props {
  /** Indica se está carregando dados */
  loading?: boolean;
}

interface Emits {
  (e: 'filter', filters: UserFilters): void;
  (e: 'clear'): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

const name = ref('');
const cpf = ref('');
const isTyping = ref(false);

/** Indica se está em processo de busca (digitando ou carregando) */
const isSearching = computed(() => isTyping.value || props.loading);

/**
 * Emite o filtro após debounce
 */
function emitFilter(): void {
  isTyping.value = false;
  emit('filter', {
    name: name.value || undefined,
    cpf: cpf.value || undefined,
  });
}

/**
 * Debounce de 400ms para evitar requisições excessivas
 * Usa useDebounceFn do VueUse para código mais limpo
 */
const debouncedFilter = useDebounceFn(emitFilter, 400);

/**
 * Dispara busca com indicador de digitação
 */
function triggerSearch(): void {
  isTyping.value = true;
  debouncedFilter();
}

/**
 * Handler para input de nome
 */
function onNameInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  name.value = input.value;
  triggerSearch();
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

  cpf.value = value;
  triggerSearch();
}

/**
 * Limpa todos os filtros
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
        <label for="filter-name">Nome</label>
        <div class="user-filters__input-wrapper">
          <input
            id="filter-name"
            :value="name"
            @input="onNameInput"
            type="text"
            placeholder="Buscar por nome..."
            :class="{ 'is-searching': isSearching }"
          />
          <span v-if="isSearching && name" class="user-filters__spinner" aria-label="Buscando..."></span>
        </div>
      </div>

      <div class="user-filters__field">
        <label for="filter-cpf">CPF</label>
        <div class="user-filters__input-wrapper">
          <input
            id="filter-cpf"
            :value="cpf"
            @input="formatCpf"
            type="text"
            placeholder="000.000.000-00"
            maxlength="14"
            :class="{ 'is-searching': isSearching }"
          />
          <span v-if="isSearching && cpf" class="user-filters__spinner" aria-label="Buscando..."></span>
        </div>
      </div>

      <div class="user-filters__actions">
        <span v-if="isSearching" class="user-filters__status">
          Buscando...
        </span>
        <button
          v-if="name || cpf"
          class="btn btn--secondary user-filters__clear"
          @click="clearFilters"
          type="button"
          :disabled="isSearching"
        >
          Limpar
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.user-filters {
  margin-bottom: $spacing-6;

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

    label {
      display: block;
      margin-bottom: $spacing-2;
      font-size: $font-size-sm;
      color: $color-subtext;
    }

    input {
      width: 100%;
      transition: border-color 0.2s ease;

      &.is-searching {
        border-color: $color-mauve;
      }
    }
  }

  &__input-wrapper {
    position: relative;
  }

  &__spinner {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: $color-mauve;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    flex-shrink: 0;
  }

  &__status {
    font-size: $font-size-sm;
    color: $color-mauve;
    animation: pulse 1.5s ease-in-out infinite;
  }

  &__clear {
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

@keyframes spin {
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>

