<script setup lang="ts">
import { ref, computed } from 'vue';
import api from '@/services/api';

const props = defineProps<{
  userId: number;
  initialName?: string;
  email?: string;
}>();

const emit = defineEmits<{
  completed: [];
  error: [message: string];
}>();

const form = ref({
  name: props.initialName || '',
  birth_date: '',
  cpf: '',
});

const loading = ref(false);
const errors = ref<Record<string, string[]>>({});

// CPF Mask
function formatCpf(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

function handleCpfInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const formatted = formatCpf(input.value);
  form.value.cpf = formatted;
  input.value = formatted;
}

const isFormValid = computed(() => {
  return form.value.name.trim() !== '' && 
         form.value.birth_date !== '' && 
         form.value.cpf.length === 14;
});

async function handleSubmit() {
  if (!isFormValid.value) return;
  
  loading.value = true;
  errors.value = {};
  
  try {
    const response = await api.post('/registration/complete', {
      user_id: props.userId,
      name: form.value.name,
      birth_date: form.value.birth_date,
      cpf: form.value.cpf,
    });
    
    if (response.data.success) {
      emit('completed');
    }
  } catch (error: any) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    } else {
      emit('error', error.response?.data?.message || 'Erro ao completar cadastro');
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="registration-container">
    <div class="registration-card">
      <div class="card-header">
        <h2>📝 Complete seu Cadastro</h2>
        <p class="subtitle">Preencha as informações abaixo para finalizar</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="registration-form">
        <!-- Email (readonly) -->
        <div class="form-group">
          <label for="email">E-mail</label>
          <input 
            id="email" 
            type="email" 
            :value="email"
            disabled
            class="input-disabled"
          />
          <span class="hint">Vinculado à sua conta Google</span>
        </div>
        
        <!-- Name -->
        <div class="form-group">
          <label for="name">Nome Completo *</label>
          <input 
            id="name" 
            v-model="form.name" 
            type="text" 
            required 
            placeholder="Digite seu nome completo"
            :class="{ 'input-error': errors.name }"
          />
          <span v-if="errors.name" class="error">{{ errors.name[0] }}</span>
        </div>
        
        <!-- Birth Date -->
        <div class="form-group">
          <label for="birth_date">Data de Nascimento *</label>
          <input 
            id="birth_date" 
            v-model="form.birth_date" 
            type="date"
            required
            :class="{ 'input-error': errors.birth_date }"
          />
          <span v-if="errors.birth_date" class="error">{{ errors.birth_date[0] }}</span>
        </div>
        
        <!-- CPF -->
        <div class="form-group">
          <label for="cpf">CPF *</label>
          <input 
            id="cpf" 
            :value="form.cpf"
            @input="handleCpfInput"
            type="text" 
            required 
            placeholder="000.000.000-00"
            maxlength="14"
            :class="{ 'input-error': errors.cpf }"
          />
          <span v-if="errors.cpf" class="error">{{ errors.cpf[0] }}</span>
        </div>
        
        <button 
          type="submit" 
          class="btn-submit"
          :disabled="!isFormValid || loading"
        >
          <span v-if="loading">Salvando...</span>
          <span v-else>✓ Finalizar Cadastro</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.registration-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
}

.registration-card {
  width: 100%;
  max-width: 480px;
  background: #1e1e2e;
  border-radius: 16px;
  border: 1px solid #313244;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.card-header {
  padding: 2rem 2rem 1.5rem;
  background: linear-gradient(135deg, #89b4fa 0%, #74c7ec 100%);
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #11111b;
  font-size: 1.5rem;
  font-weight: 700;
}

.subtitle {
  margin: 0.5rem 0 0;
  color: #1e1e2e;
  font-size: 0.875rem;
  opacity: 0.8;
}

.registration-form {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
  padding: 0.875rem 1rem;
  border: 1px solid #45475a;
  border-radius: 8px;
  background: #11111b;
  color: #cdd6f4;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  outline: none;
  border-color: #89b4fa;
  box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.2);
}

.input-disabled {
  background: #181825;
  color: #6c7086;
  cursor: not-allowed;
}

.input-error {
  border-color: #f38ba8;
}

.hint {
  color: #6c7086;
  font-size: 0.75rem;
}

.error {
  color: #f38ba8;
  font-size: 0.75rem;
}

.btn-submit {
  margin-top: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #a6e3a1, #94e2d5);
  border: none;
  border-radius: 8px;
  color: #11111b;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(166, 227, 161, 0.3);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>

