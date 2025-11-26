<script setup>
// Traemos las funciones necesarias de Vue, Firebase y nuestros Stores.
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signOut } from "firebase/auth";
import { usePrestamosStore } from '../../stores/prestamosStore.js'
import { useAuthStore } from '../../stores/authStore.js'

// Guardamos las herramientas en variables para usarlas más abajo.
const prestamosStore = usePrestamosStore() // Para manejar los préstamos.
const authStore = useAuthStore() // Para manejar al usuario conectado.
const router = useRouter() // Para cambiar de página.
const auth = getAuth() // Para hablar con Firebase Auth.

onMounted(async () => {
  // Intenta leer el ID del usuario desde el Store.
  // Busca en dos lugares posibles para asegurarse de encontrarlo.
  const userID = authStore.usuario?.ID_Usuario || authStore.usuario?.uid; 

  // Escribe el ID en la consola para comprobar que todo va bien.
  console.log("UserID del Store para buscar préstamos:", userID); 

  if (userID) { 
    // SI HAY USUARIO: Le dice al Store que busque los préstamos de este ID.
    await prestamosStore.fetchMisPrestamos(userID); 
  } else {
    // SI NO HAY USUARIO: Lo manda de vuelta a la página de Login.
    router.push('/');
  }
})

const handleLogout = async () => {
  try {
    // Avisa a Firebase que cierre la sesión real.
     await signOut(auth) 
    // Limpia los datos del usuario de nuestra memoria local.
    authStore.clearUser() 
   // Manda al usuario a la pantalla de Login.
    router.push('/') 
  } catch (error) {
    // Si falla, muestra el error en la consola y una alerta.
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
        class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md w-full sm:w-auto transition-all duration-200"
        @click="handleLogout">
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