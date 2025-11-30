<template>
  <header class="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
    <h2 class="text-lg font-medium text-gray-700">Panel de Administración</h2>

    <button
      class="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50 transition"
      @click="handleLogout"
    >
      Cerrar sesión
    </button>
  </header>
</template>

<script setup>
import { getAuth, signOut } from "firebase/auth";
import { useLoginStore } from '../../stores/login.js' 
import { useRouter } from 'vue-router'

const loginStore = useLoginStore() 
const router = useRouter()
const auth = getAuth()

const handleLogout = async () => {
  try {
    await signOut(auth)
    loginStore.uid = null
    loginStore.usuario = null
    loginStore.email = null
    loginStore.rol = null
    loginStore.token = null
    
    router.push('/')
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
  }
}
</script>
