<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import UserForm from '@/components/UserForm.vue';
import UserList from '@/components/UserList.vue';
import RegistrationForm from '@/components/RegistrationForm.vue';
import type { User } from '@/types/User';

const userStore = useUserStore();
const authStore = useAuthStore();
const editingUser = ref<User | undefined>(undefined);
const showForm = ref(false);
const successMessage = ref('');

onMounted(() => {
  // Check for OAuth callback
  if (window.location.pathname === '/auth/callback' || window.location.search.includes('success=')) {
    authStore.handleCallback();
  }
  
  // Load user from storage
  authStore.loadFromStorage();
  
  // Fetch users
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

function handleRegistrationCompleted() {
  authStore.completeRegistration();
  userStore.fetchUsers();
  successMessage.value = 'Cadastro concluído com sucesso! Um e-mail de confirmação foi enviado.';
  setTimeout(() => {
    successMessage.value = '';
  }, 5000);
}

function handleRegistrationError(message: string) {
  alert(message);
}
</script>

<template>
  <div class="home">
    <header class="header">
      <h1>📋 Cadastro de Usuários</h1>
      
      <div class="header-actions">
        <!-- Auth Section -->
        <div v-if="authStore.isAuthenticated" class="user-info">
          <img 
            v-if="authStore.user?.avatar" 
            :src="authStore.user.avatar" 
            :alt="authStore.user.name"
            class="avatar"
          />
          <span class="user-name">{{ authStore.user?.name }}</span>
          <button class="btn-logout" @click="authStore.logout()">
            Sair
          </button>
        </div>
        <!-- Google Sign-In Button following official branding guidelines -->
        <!-- https://developers.google.com/identity/branding-guidelines -->
        <button v-else class="gsi-material-button" @click="authStore.loginWithGoogle()">
          <div class="gsi-material-button-state"></div>
          <div class="gsi-material-button-content-wrapper">
            <div class="gsi-material-button-icon">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="display: block;">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
            </div>
            <span class="gsi-material-button-contents">Fazer login com o Google</span>
          </div>
        </button>

        <button 
          v-if="authStore.isAuthenticated && !authStore.needsRegistration && !showForm" 
          class="btn-add" 
          @click="showForm = true"
        >
          + Novo Usuário
        </button>
      </div>
    </header>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-banner">
      ✅ {{ successMessage }}
    </div>

    <main class="content">
      <!-- Registration Form for new Google users -->
      <section v-if="authStore.needsRegistration && authStore.user">
        <RegistrationForm
          :userId="authStore.user.id"
          :initialName="authStore.user.name"
          :email="authStore.user.email"
          @completed="handleRegistrationCompleted"
          @error="handleRegistrationError"
        />
      </section>

      <!-- Main content for registered users -->
      <template v-else>
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
      </template>
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
  flex-wrap: wrap;
  gap: 1rem;
}

h1 {
  color: #cdd6f4;
  font-size: 2rem;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: #1e1e2e;
  border-radius: 8px;
  border: 1px solid #313244;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  color: #cdd6f4;
  font-size: 0.875rem;
}

.btn-logout {
  padding: 0.4rem 0.75rem;
  background: transparent;
  border: 1px solid #f38ba8;
  border-radius: 6px;
  color: #f38ba8;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: rgba(243, 139, 168, 0.1);
}

/* Google Sign-In Button - Official Branding Guidelines */
/* https://developers.google.com/identity/branding-guidelines */
.gsi-material-button {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  appearance: none;
  background-color: #131314;
  background-image: none;
  border: 1px solid #747775;
  border-radius: 20px;
  box-sizing: border-box;
  color: #e3e3e3;
  cursor: pointer;
  font-family: 'Roboto', arial, sans-serif;
  font-size: 14px;
  height: 40px;
  letter-spacing: 0.25px;
  outline: none;
  overflow: hidden;
  padding: 0 12px;
  position: relative;
  text-align: center;
  transition: background-color 0.218s, border-color 0.218s, box-shadow 0.218s;
  vertical-align: middle;
  white-space: nowrap;
  width: auto;
  min-width: min-content;
}

.gsi-material-button .gsi-material-button-icon {
  height: 20px;
  margin-right: 12px;
  min-width: 20px;
  width: 20px;
}

.gsi-material-button .gsi-material-button-content-wrapper {
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 100%;
  justify-content: space-between;
  position: relative;
  width: 100%;
}

.gsi-material-button .gsi-material-button-contents {
  flex-grow: 1;
  font-family: 'Roboto', arial, sans-serif;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: top;
}

.gsi-material-button .gsi-material-button-state {
  bottom: 0;
  left: 0;
  opacity: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: opacity 0.218s;
  background-color: #e3e3e3;
}

.gsi-material-button:hover {
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.30), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
}

.gsi-material-button:hover .gsi-material-button-state {
  opacity: 0.08;
}

.gsi-material-button:active .gsi-material-button-state {
  opacity: 0.12;
}

.gsi-material-button:focus .gsi-material-button-state {
  opacity: 0.12;
}

.gsi-material-button:disabled {
  cursor: default;
  background-color: #13131461;
  border-color: #8e918f1f;
}

.gsi-material-button:disabled .gsi-material-button-contents,
.gsi-material-button:disabled .gsi-material-button-icon {
  opacity: 0.38;
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

.success-banner {
  max-width: 1200px;
  margin: 0 auto 1.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, rgba(166, 227, 161, 0.2), rgba(148, 226, 213, 0.2));
  border: 1px solid #a6e3a1;
  border-radius: 8px;
  color: #a6e3a1;
  text-align: center;
  font-weight: 500;
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
