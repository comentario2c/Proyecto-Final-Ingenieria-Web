<script setup>
// Importaciones normales
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signOut } from "firebase/auth";
import { usePrestamosStore } from '../../stores/prestamosStore.js'
import { useLoginStore } from '../../stores/login.js' 

// Inicializamos herramientas
const prestamosStore = usePrestamosStore()
const loginStore = useLoginStore() 
const router = useRouter()
const auth = getAuth()

onMounted(async () => {
  const userID = loginStore.uid; 
  console.log("UserID recibido del LoginStore:", userID); 

  if (userID) { 
    await prestamosStore.fetchMisPrestamos(userID); 
  } else {
    console.warn("No hay usuario en el LoginStore. Redirigiendo...");
    router.push('/');
  }
})

const handleLogout = async () => {
  try {
    await signOut(auth) 
    // Vaciamos manualmente porque el clearStore del compañero no funciona
    loginStore.uid = null
    loginStore.nombre = null
    loginStore.email = null
    loginStore.rol = null
    loginStore.token = null
    
    router.push('/') 
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
  }
}
</script>

<template>
  <div class="p-4 sm:p-8 max-w-5xl mx-auto min-h-screen bg-gray-50">
    
    <header class="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0 text-center sm:text-left">
        Bienvenido, {{ loginStore.nombre || 'Alumno' }}
      </h1>
      <button 
        class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition-all duration-200 w-full sm:w-auto"
        @click="handleLogout">
        Cerrar Sesión
      </button>
    </header>
    
    <section class="bg-white rounded-xl shadow-md overflow-hidden">
      <div class="p-5 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-800">Mis Préstamos</h2>
        <p class="text-sm text-gray-500 mt-1">Historial de tus equipos.</p>
      </div>
      
      <div v-if="prestamosStore.misPrestamos.length > 0" class="p-4 sm:p-6">
        
        <div class="hidden sm:flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider pb-3 border-b border-gray-200 mb-2">
          <div class="w-1/2 pl-2">Equipo / Detalles</div>
          <div class="w-1/4 text-center">Fecha Solicitud</div>
          <div class="w-1/4 text-right pr-2">Estado</div>
        </div>

        <div class="divide-y divide-gray-100">
          
          <div 
            v-for="prestamo in prestamosStore.misPrestamos" 
            :key="prestamo.ID_Prestamo" 
            class="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0"
          >
            <div class="sm:w-1/2 flex flex-col">
              <span class="font-bold text-gray-900 text-lg">{{ prestamo.modelo }}</span>
              <span class="text-sm text-gray-500 flex items-center mt-1">
                 <span class="text-gray-400 mr-1"># Serie:</span> {{ prestamo.numeroSerie }}
              </span>
            </div>
             
            <div class="sm:w-1/4 flex items-center sm:justify-center text-gray-600 text-sm">
                <span class="font-medium">
                    {{ prestamo.fechaPrestamo ? new Date(prestamo.fechaPrestamo).toLocaleDateString() : 'Fecha pendiente' }}
                </span>
            </div>

            <div class="sm:w-1/4 flex justify-start sm:justify-end mt-1 sm:mt-0">
              <span 
                class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border shadow-sm"
                :class="{
                  'bg-blue-50 text-blue-700 border-blue-200': prestamo.estado === 'Activo' || prestamo.estado === 'en_prestamo',
                  'bg-gray-100 text-gray-600 border-gray-200': prestamo.estado === 'Finalizado' || prestamo.estado === 'disponible'
                }"
              >
                {{ prestamo.estado ? prestamo.estado.toUpperCase() : 'DESCONOCIDO' }}
              </span>
            </div>
          </div> 
        </div>
      </div>
      
      <div v-else class="flex flex-col items-center justify-center p-12 text-center bg-gray-50">
        <p class="text-gray-900 font-medium text-lg">Sin préstamos</p>
        <p class="text-sm text-gray-500 mt-1">No tienes historial activo.</p>
      </div>
    </section>
  </div>
</template>