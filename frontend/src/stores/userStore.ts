import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import type { User } from '@/types/User';

export const useUserStore = defineStore('user', () => {
    const users = ref<User[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function fetchUsers() {
        loading.value = true;
        try {
            const response = await api.get('/users');
            users.value = response.data;
        } catch (e) {
            error.value = 'Erro ao carregar usuários';
        } finally {
            loading.value = false;
        }
    }

    async function createUser(user: User) {
        const response = await api.post('/users', user);
        users.value.unshift(response.data);
        return response.data;
    }

    async function updateUser(id: number, user: User) {
        const response = await api.put(`/users/${id}`, user);
        const index = users.value.findIndex(u => u.id === id);
        if (index !== -1) {
            users.value[index] = response.data;
        }
        return response.data;
    }

    async function deleteUser(id: number) {
        await api.delete(`/users/${id}`);
        users.value = users.value.filter(u => u.id !== id);
    }

    return { users, loading, error, fetchUsers, createUser, updateUser, deleteUser };
});