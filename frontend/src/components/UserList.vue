<script setup lang="ts">
import type { User } from '@/types/User';

defineProps<{
  users: User[];
}>();

const emit = defineEmits<{
  edit: [user: User];
  delete: [id: number];
}>();

function formatDate(date?: string) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}
</script>

<template>
  <div class="user-list">
    <div v-if="users.length === 0" class="empty-state">
      <p>Nenhum usuário cadastrado ainda.</p>
    </div>
    
    <div v-else class="users-grid">
      <div v-for="user in users" :key="user.id" class="user-card">
        <div class="user-info">
          <h3>{{ user.name }}</h3>
          <p class="email">{{ user.email }}</p>
          <p v-if="user.phone" class="phone">📱 {{ user.phone }}</p>
          <p v-if="user.birth_date" class="birth">🎂 {{ formatDate(user.birth_date) }}</p>
        </div>
        
        <div class="user-actions">
          <button class="btn-edit" @click="emit('edit', user)">
            ✏️ Editar
          </button>
          <button class="btn-delete" @click="emit('delete', user.id!)">
            🗑️ Excluir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-list {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6c7086;
  background: #1e1e2e;
  border-radius: 12px;
  border: 1px dashed #45475a;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.user-card {
  background: #1e1e2e;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #313244;
  transition: transform 0.2s, box-shadow 0.2s;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.user-info h3 {
  margin: 0 0 0.5rem 0;
  color: #cdd6f4;
  font-size: 1.25rem;
}

.email {
  color: #89b4fa;
  margin: 0 0 0.75rem 0;
}

.phone, .birth {
  color: #a6adc8;
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #313244;
}

.btn-edit, .btn-delete {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.btn-edit {
  background: #45475a;
  color: #cdd6f4;
}

.btn-edit:hover {
  background: #585b70;
}

.btn-delete {
  background: #45475a;
  color: #f38ba8;
}

.btn-delete:hover {
  background: rgba(243, 139, 168, 0.2);
}
</style>