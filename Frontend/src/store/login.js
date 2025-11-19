import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoginStore = defineStore('login', () => {
    const token = ref(null)
    const email = ref(null)
    const uid = ref(null)
    const nombre = ref(null)
    const rol = ref(null)

    return { token, email, uid, nombre, rol}
})