import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoginStore = defineStore('login', () => {
    const token = ref(null)
    const rol = ref(null)
    const usuario = ref(null)
    const uid = ref(null)

    return { token, rol, usuario, uid }
}, {
    persist: true
})