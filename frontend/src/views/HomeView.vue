<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import UserForm from '@/components/UserForm.vue';
import UserList from '@/components/UserList.vue';
import type { User } from '@/types/User';

const userStore = useUserStore();
const editingUser = ref<User | undefined>(undefined);
const showForm = ref(false);

onMounted(() => {
  userStore.fetchUsers();
});

async function handleSubmit(userData: User) {
  try {
    if (editingUser.value?.id) {
      await userStore.updateUser(editingUser.value.id, userData);
    } else {
      await userStore.createUser(userData);
    }
    showForm.value = false;
    editingUser.value = undefined;
  } catch (error: any) {
    alert(error.response?.data?.message || 'Erro ao salvar usuário');
  }
}

function handleEdit(user: User) {
  editingUser.value = user;
  showForm.value = true;
}

async function handleDelete(id: number) {
  if (confirm('Tem certeza que deseja excluir este usuário?')) {
    await userStore.deleteUser(id);
  }
}

function handleCancel() {
  showForm.value = false;
  editingUser.value = undefined;
}
</script>

<template>
  <div class="home">
    <header class="header">
      <h1>📋 Cadastro de Usuários</h1>
      <button v-if="!showForm" class="btn-add" @click="showForm = true">
        + Novo Usuário
      </button>
    </header>

    <main class="content">
      <section v-if="showForm" class="form-section">
        <h2>{{ editingUser?.id ? 'Editar Usuário' : 'Novo Usuário' }}</h2>
        <UserForm 
          :user="editingUser" 
          @submit="handleSubmit" 
          @cancel="handleCancel" 
        />
      </section>

      <section class="list-section">
        <h2>Usuários Cadastrados</h2>
        <div v-if="userStore.loading" class="loading">Carregando...</div>
        <UserList 
          v-else
          :users="userStore.users" 
          @edit="handleEdit" 
          @delete="handleDelete" 
        />
      </section>
    </main>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #11111b 0%, #181825 100%);
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto 2rem;
}

h1 {
  color: #cdd6f4;
  font-size: 2rem;
  margin: 0;
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #a6e3a1, #94e2d5);
  border: none;
  border-radius: 8px;
  color: #11111b;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-add:hover {
  transform: scale(1.05);
}

.content {
  max-width: 1200px;
  margin: 0 auto;
}

.form-section, .list-section {
  margin-bottom: 2rem;
}

h2 {
  color: #cdd6f4;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.loading {
  text-align: center;
  color: #6c7086;
  padding: 2rem;
}
</style>