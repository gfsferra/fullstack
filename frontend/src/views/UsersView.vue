<script setup lang="ts">
/**
 * UsersView - Página de listagem de usuários
 * Com filtros otimizados e paginação para grandes volumes
 */
import { onMounted } from 'vue';
import { useUserStore, type UserFilters } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import UserList from '@/components/users/UserList.vue';
import UserHeader from '@/components/users/UserHeader.vue';
import UserFiltersComponent from '@/components/users/UserFilters.vue';
import UserPagination from '@/components/users/UserPagination.vue';

const userStore = useUserStore();
const authStore = useAuthStore();

onMounted(async () => {
  await userStore.fetchUsers();
});

/**
 * Aplica filtros
 */
async function handleFilter(filters: UserFilters): Promise<void> {
  await userStore.applyFilters(filters);
}

/**
 * Limpa filtros
 */
async function handleClearFilters(): Promise<void> {
  await userStore.clearFilters();
}
</script>

<template>
  <div class="users-view">
    <UserHeader :user="authStore.user" @logout="authStore.logout()" />

    <main class="users-view__content">
      <!-- Lista de usuários -->
      <section class="users-view__list-section">
        <div class="card">
          <div class="card__header flex-between">
            <h2 class="card__title">Usuários Cadastrados</h2>
            <span class="users-view__count">
              {{ userStore.total }} usuário(s)
            </span>
          </div>
          <div class="card__body">
            <!-- Filtros -->
            <UserFiltersComponent
              :loading="userStore.loading"
              @filter="handleFilter"
              @clear="handleClearFilters"
            />

            <!-- Loading -->
            <div v-if="userStore.loading" class="users-view__loading">
              <div class="loading-spinner"></div>
              <p>Carregando usuários...</p>
            </div>

            <!-- Lista -->
            <template v-else>
              <UserList :users="userStore.users" />

              <!-- Paginação -->
              <UserPagination
                :current-page="userStore.currentPage"
                :last-page="userStore.lastPage"
                :total="userStore.total"
                @previous="userStore.previousPage()"
                @next="userStore.nextPage()"
                @goto="userStore.goToPage"
              />
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

  &__content {
    max-width: 1200px;
    margin: 0 auto;
    padding: $spacing-6;
    display: flex;
    flex-direction: column;
    gap: $spacing-6;
  }

  &__count {
    font-size: $font-size-sm;
    color: $color-subtext;
    background: $bg-secondary;
    padding: $spacing-2 $spacing-4;
    border-radius: $border-radius-full;
  }

  &__loading {
    @include flex-column;
    align-items: center;
    gap: $spacing-4;
    padding: $spacing-12;
    color: $color-subtext;
  }
}
</style>
