<script setup lang="ts">
/**
 * UserFilters - Componente de filtros para lista de usuários
 * Implementa debounce para otimização de buscas em grandes volumes
 */
import { ref, watch } from 'vue';
import type { UserFilters } from '@/stores/userStore';

interface Emits {
  (e: 'filter', filters: UserFilters): void;
  (e: 'clear'): void;
}

const emit = defineEmits<Emits>();

const name = ref('');
const cpf = ref('');
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Debounce de 300ms para evitar requisições excessivas
 */
function debounceFilter(): void {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  
  debounceTimeout = setTimeout(() => {
    emit('filter', {
      name: name.value || undefined,
      cpf: cpf.value || undefined,
    });
  }, 300);
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
  debounceFilter();
}

/**
 * Limpa todos os filtros
 */
function clearFilters(): void {
  name.value = '';
  cpf.value = '';
  emit('clear');
}

// Watch para mudanças no nome
watch(name, () => {
  debounceFilter();
});
</script>

<template>
  <div class="user-filters">
    <div class="user-filters__fields">
      <div class="user-filters__field">
        <label for="filter-name">Nome</label>
        <input
          id="filter-name"
          v-model="name"
          type="text"
          placeholder="Buscar por nome..."
        />
      </div>

      <div class="user-filters__field">
        <label for="filter-cpf">CPF</label>
        <input
          id="filter-cpf"
          :value="cpf"
          @input="formatCpf"
          type="text"
          placeholder="000.000.000-00"
          maxlength="14"
        />
      </div>

      <button
        v-if="name || cpf"
        class="btn btn--secondary user-filters__clear"
        @click="clearFilters"
        type="button"
      >
        Limpar
      </button>
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
    }
  }

  &__clear {
    flex-shrink: 0;
  }
}
</style>

