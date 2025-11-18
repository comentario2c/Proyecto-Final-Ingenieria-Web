<script setup>
// Hook para "cuando la página carga"
import { onMounted } from 'vue'
// Para redirigir al usuario
import { useRouter } from 'vue-router'
// Para cerrar sesión de Google
import { getAuth, signOut } from "firebase/auth";
// "Cerebro" de los préstamos
import { usePrestamosStore } from '../../stores/prestamosStore.js'
 // "Cerebro" del usuario
import { useAuthStore } from '../../stores/authStore.js'

// Flujo de la Página de Alumno
// 1. La página se carga (el componente se "monta").
// 2. Se activa el hook 'onMounted'.
// 3. Se revisa el 'authStore' (Pinia) para ver si hay un usuario logueado.
//    3.1 Si NO hay usuario (ej. recargó la página o entró por URL), se le "patea" al login ('/').
//    3.2 Si SÍ hay usuario, se obtiene su ID_Usuario.
// 4. Se llama a la acción 'prestamosStore.fetchMisPrestamos(ID_Usuario)'.
//    4.1 El 'prestamosStore' llama al backend (GET /api/prestamos/usuario/...).
//    4.2 El backend devuelve la lista de préstamos SÓLO de ese usuario.
//    4.3 El 'prestamosStore' guarda esa lista en su 'state'.
// 5. El template (HTML) reacciona automáticamente y muestra la lista (v-for).
//    5.1 Si la lista está vacía, muestra el mensaje "No tienes préstamos...".
// 6. El usuario puede hacer clic en "Cerrar Sesión" en cualquier momento.
//    6.1 Se llama a la función 'handleLogout'.
//    6.2 Se cierra la sesión en Firebase (signOut).
//    6.3 Se limpia el 'authStore' (borra los datos del usuario).
//    6.4 Se redirige al login ('/').

// Inicialización de Herramientas 
const prestamosStore = usePrestamosStore() // Instancia del store de préstamos
const authStore = useAuthStore() // Instancia del store de autenticación
const router = useRouter() // Instancia del router
const auth = getAuth() // Instancia de Firebase Auth

/**
 * @nombre onMounted
 * @desc Se ejecuta una vez que el componente se ha cargado en la página.
 * Su trabajo es verificar la sesión y cargar los datos iniciales.
 */
onMounted(async () => {
  // Revisar el authStore
  if (authStore.usuario?.ID_Usuario) {
    // si hay un usuario, buscar sus préstamos
    await prestamosStore.fetchMisPrestamos(authStore.usuario.ID_Usuario)
  } else {
    // No hay usuario, proteger la ruta
    router.push('/')
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
        Portal de Alumno
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