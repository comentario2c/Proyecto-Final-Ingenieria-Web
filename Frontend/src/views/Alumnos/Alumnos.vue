<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signOut } from "firebase/auth";
import { usePrestamosStore } from '../../stores/prestamosStore.js'
import { useAuthStore } from '../../stores/authStore.js'

// Inicialización de Herramientas 
const prestamosStore = usePrestamosStore() // Instancia del store de préstamos
const authStore = useAuthStore() // Instancia del store de autenticación
const router = useRouter() // Instancia del router
const auth = getAuth() // Instancia de Firebase Auth

/**
 * @nombre onMounted
 * @desc Se ejecuta una vez que el componente se ha cargado en la página.
 */
onMounted(async () => {
  // 1. Obtener el ID del Store de forma robusta
  const userID = authStore.usuario?.ID_Usuario || authStore.usuario?.uid; 

  // Línea de debugging
  console.log("UserID del Store para buscar préstamos:", userID); 

  if (userID) { 
    // 2. Si hay ID, buscar préstamos
    await prestamosStore.fetchMisPrestamos(userID); 
  } else {
    // 3. Si no hay ID, redirigir al login
    router.push('/');
  }
})

/**
 * @nombre handleLogout
 * @desc Se activa con el botón "Cerrar Sesión".
 * Limpia la sesión del usuario y lo redirige.
 */
const handleLogout = async () => {
  try {
    // Cerrar sesión en Firebase
    await signOut(auth) 
    // Limpiar el "cerebro" (Pinia)
    authStore.clearUser() 
    // Redirigir al login
    router.push('/') 
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    alert("Error al cerrar sesión.")
  }
}
</script>

<template>
  <div class="p-4 sm:p-8 max-w-4xl mx-auto min-h-screen bg-gray-50">
    
    <header class="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
      <h1 class="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
        Bienvenido, {{ authStore.usuario?.nombre || 'Alumno' }}
      </h1>
      <button 
        @click="handleLogout"
        class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md w-full sm:w-auto transition-all duration-200">
        Cerrar Sesión
      </button>
    </header>
    
    <section class="bg-white p-4 md:p-6 rounded-xl shadow-lg">
      <h2 class="text-2xl font-semibold mb-5 text-gray-800">Mis Préstamos</h2>
      
      <div v-if="prestamosStore.misPrestamos.length > 0">
        
        <div class="divide-y divide-gray-200">
          
          <div 
            v-for="prestamo in prestamosStore.misPrestamos" 
            :key="prestamo.ID_Prestamo" 
            class="py-4 flex flex-col sm:flex-row justify-between sm:items-center"
          >
            <div>
              <p class="font-medium text-lg text-gray-900">{{ prestamo.modelo }}</p>
              <p class="text-sm text-gray-500">Número de Serie: {{ prestamo.numeroSerie }}</p>
              <p class="text-sm text-gray-500 mt-1">
                Solicitado el: {{ new Date(prestamo.fechaPrestamo).toLocaleDateString() }}
              </p>
            </div>
            
            <div class="mt-3 sm:mt-0">
              <span 
                class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-green-100 text-green-800': prestamo.estado === 'Activo',
                  'bg-gray-100 text-gray-700': prestamo.estado === 'Finalizado'
                }"
              >
                {{ prestamo.estado }}
              </span>
            </div>
          </div> </div>
      </div>
      
      <div v-else>
        <p class="text-center text-gray-500 p-6">No tienes préstamos activos o finalizados.</p>
      </div>
    </section>
  </div>
</template>