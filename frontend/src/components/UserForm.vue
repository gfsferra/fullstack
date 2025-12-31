<script setup lang="ts">
import { ref, watch } from 'vue';
import type { User } from '@/types/User';

const props = defineProps<{
  user?: User;
}>();

const emit = defineEmits<{
  submit: [user: User];
  cancel: [];
}>();

const form = ref<User>({
  name: '',
  email: '',
  phone: '',
  birth_date: '',
});

watch(() => props.user, (newUser) => {
  if (newUser) {
    form.value = { ...newUser };
  }
}, { immediate: true });

function handleSubmit() {
  emit('submit', { ...form.value });
  form.value = { name: '', email: '', phone: '', birth_date: '' };
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="user-form">
    <div class="form-group">
      <label for="name">Nome *</label>
      <input 
        id="name" 
        v-model="form.name" 
        type="text" 
        required 
        placeholder="Digite o nome"
      />
    </div>

    <div class="form-group">
      <label for="email">E-mail *</label>
      <input 
        id="email" 
        v-model="form.email" 
        type="email" 
        required 
        placeholder="Digite o e-mail"
      />
    </div>

    <div class="form-group">
      <label for="phone">Telefone</label>
      <input 
        id="phone" 
        v-model="form.phone" 
        type="text" 
        placeholder="(00) 00000-0000"
      />
    </div>

    <div class="form-group">
      <label for="birth_date">Data de Nascimento</label>
      <input 
        id="birth_date" 
        v-model="form.birth_date" 
        type="date"
      />
    </div>

    <div class="form-actions">
      <button type="submit" class="btn-primary">
        {{ user?.id ? 'Atualizar' : 'Cadastrar' }}
      </button>
      <button type="button" class="btn-secondary" @click="emit('cancel')">
        Cancelar
      </button>
    </div>
  </form>
</template>

<style scoped>
.user-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #1e1e2e;
  border-radius: 12px;
  border: 1px solid #313244;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: #cdd6f4;
  font-size: 0.875rem;
}

input {
  padding: 0.75rem 1rem;
  border: 1px solid #45475a;
  border-radius: 8px;
  background: #11111b;
  color: #cdd6f4;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #89b4fa;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn-primary {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #89b4fa, #74c7ec);
  border: none;
  border-radius: 8px;
  color: #11111b;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(137, 180, 250, 0.3);
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid #45475a;
  border-radius: 8px;
  color: #a6adc8;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #313244;
}
</style>