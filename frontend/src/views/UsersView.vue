<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useUserStore, type UserFilters } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import UserList from '@/components/users/UserList.vue';
import UserHeader from '@/components/users/UserHeader.vue';
import UserFiltersComponent from '@/components/users/UserFilters.vue';
import UserPagination from '@/components/users/UserPagination.vue';
import TableSkeleton from '@/components/ui/TableSkeleton.vue';

/**
 * Define o store de usuários
 * @function useUserStore
 * @returns {UserStore} Store de usuários
 */
const userStore = useUserStore();

/**
 * Define o store de autenticação
 * @function useAuthStore
 * @returns {AuthStore} Store de autenticação
 */
const authStore = useAuthStore();

/**
 * Define se o carregamento inicial está sendo exibido
 * @function isInitialLoading
 * @returns {boolean} Se o carregamento inicial está sendo exibido
 */
const isInitialLoading = computed(() => userStore.loading && userStore.users.length === 0);

/**
 * Monta o componente
 * @function onMounted
 * @returns {void}
 */
onMounted(async () => {
  await userStore.fetchUsers();
});

/**
 * Gerencia o filtro de usuários
 * @function handleFilter
 * @param {UserFilters} filters - Filtros de usuários
 * @returns {Promise<void>} Promise
 */
async function handleFilter(filters: UserFilters): Promise<void> {
  await userStore.applyFilters(filters);
}

/**
 * Gerencia o limpar dos filtros de usuários
 * @function handleClearFilters
 * @returns {Promise<void>} Promise
 */
async function handleClearFilters(): Promise<void> {
  await userStore.clearFilters();
}
</script>

<template>
  <div class="users-view">
    <UserHeader :user="authStore.user" @logout="authStore.logout()" />

    <main class="users-view__content">
      <section class="users-view__section animate-fade-in">
        <div class="card">
          <div class="card__header users-view__card-header">
            <div class="users-view__title-wrapper">
              <h2 class="card__title">Usuários Cadastrados</h2>
              <p class="card__subtitle">Gerencie todos os usuários do sistema</p>
            </div>

            <div class="users-view__stats">
              <div class="users-view__stat">
                <span class="users-view__stat-value">{{ userStore.total }}</span>
                <span class="users-view__stat-label">Total</span>
              </div>
            </div>
          </div>

          <div class="card__body">
            <UserFiltersComponent :loading="userStore.loading" @filter="handleFilter" @clear="handleClearFilters" />

            <div v-if="isInitialLoading" class="users-view__loading">
              <TableSkeleton :rows="5" :columns="5" />
            </div>

            <template v-else>
              <div v-if="userStore.loading" class="users-view__loading-overlay">
                <div class="loading-spinner" />
              </div>

              <UserList :users="userStore.users" />

              <UserPagination :current-page="userStore.currentPage" :last-page="userStore.lastPage"
                :total="userStore.total" @previous="userStore.previousPage()" @next="userStore.nextPage()"
                @goto="userStore.goToPage" />
            </template>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.users-view {
  min-height: 100vh;
  background: var(--gradient-surface);

  &__content {
    max-width: 1200px;
    margin: 0 auto;
    padding: $spacing-6;
  }

  &__section {
    position: relative;
  }

  &__card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: $spacing-4;
  }

  &__title-wrapper {
    flex: 1;
    min-width: 200px;
  }

  .card__subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-subtext);
    margin-top: $spacing-1;
  }

  &__stats {
    display: flex;
    gap: $spacing-4;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-3 $spacing-5;
    background: var(--bg-secondary);
    border-radius: $border-radius-lg;
    border: 1px solid var(--border-color);
  }

  &__stat-value {
    font-size: var(--font-size-2xl);
    font-weight: $font-weight-bold;
    color: var(--color-lavender);
    line-height: 1;
  }

  &__stat-label {
    font-size: var(--font-size-xs);
    color: var(--color-subtext);
    text-transform: uppercase;
    letter-spacing: $letter-spacing-wider;
    margin-top: $spacing-1;
  }

  &__loading {
    padding: $spacing-4 0;
  }

  &__loading-overlay {
    position: absolute;
    inset: 0;
    @include flex-center;
    background: rgba(#1e1e2e, 0.7);
    backdrop-filter: blur(4px);
    z-index: 10;
    border-radius: $card-border-radius;
  }
}
</style>
