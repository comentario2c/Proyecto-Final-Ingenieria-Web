import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

// Configuración para conectarse con el backend
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

export const usePrestamosStore = defineStore('prestamos', () => {

  // Solo necesitamos una lista para guardar lo que llega de la base de datos
  const misPrestamos = ref([])

  // TRAE LOS PRÉSTAMOS
  async function fetchMisPrestamos(idUsuario) {
    try {
      const response = await apiClient.get(`/prestamoAlumno/${idUsuario}`)
      
      // Guardamos los datos
      misPrestamos.value = response.data
      
    } catch (error) {
      console.error("Error al buscar préstamos:", error)
      misPrestamos.value = [] // Si falla, dejamos la lista vacía
    }
  }

  // Solo retornamos lo que la pantalla 'Alumnos.vue' necesita usar
  return { 
    misPrestamos, 
    fetchMisPrestamos
  }
})