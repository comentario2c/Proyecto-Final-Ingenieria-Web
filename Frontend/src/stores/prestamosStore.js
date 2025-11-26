// defineStore: La función principal para crear un almacén de datos global.
import { defineStore } from 'pinia'
// ref: Hace que una variable sea "reactiva" (si hay algun cambio en la pantalla esta se actualiza).
import { ref } from 'vue'
// axios: Herramienta para enviar peticiones al servidor.
import { default as axios } from 'axios' 

// Creamos una herramienta para enviar mensajes al servidor.
const apiClient = axios.create({ 
  // Le decimos la dirección base del servidor.
  baseURL: import.meta.env.VITE_API_URL
});


// Creamos el Store y le damos el nombre único 'prestamos'.
export const usePrestamosStore = defineStore('prestamos', () => {


  // Creamos una variable reactiva llamada misPrestamos para guardar los préstamos que tiene el usuario.
  const misPrestamos = ref([])
  // Creamos una variable reactiva llamada equipoDisponible para guardar los equipos que están libres para prestar.
  const equiposDisponibles = ref([])

  // Función para obtener la lista de préstamos de un usuario desde el servidor.
  async function fetchMisPrestamos(idUsuario) {
    // Si no nos dan el ID del usuario, salimos de la función.
    if (!idUsuario) return; 

    try {
      // Enviamos una petición al servidor pidiendo los préstamos de ese ID.
      const response = await apiClient.get(`/prestamos/usuario/${idUsuario}`)
      
      // Si todo sale bien, guardamos la lista recibida en la variable 'misPrestamos'.
      misPrestamos.value = response.data
    } catch (error) {
      // Si hay un error, lo mostramos y dejamos la lista vacía.
      console.error("Error al buscar préstamos:", error)
      misPrestamos.value = [] 
    }
  }

  // Función para obtener la lista de equipos que están libres.
  async function fetchEquiposDisponibles() {
    try {
      // Enviamos una petición al servidor pidiendo los equipos libres.
      const response = await apiClient.get('/prestamos/equipos-disponibles');
      
      // Guardamos la lista recibida en la variable 'equiposDisponibles'.
      equiposDisponibles.value = response.data;

    } catch (error) {
      // Si hay un error, lo mostramos y vaciamos la lista.
      console.error("Error al buscar equipos disponibles:", error);
      equiposDisponibles.value = [];
    }
  }

  // Función para enviar una solicitud de préstamo al servidor.
  async function crearSolicitud(datosSolicitud) {
    try {
      // Esto es solo un mensaje de prueba .
      alert(`Solicitud enviada para el equipo: ${datosSolicitud.ID_Equipo}`);

      // Después de enviar la solicitud, actualizamos la lista de préstamos del usuario.
      await fetchMisPrestamos(datosSolicitud.ID_Usuario)

    } catch (error) {
      console.error("Error al crear la solicitud:", error)
      alert("Error: No se pudo crear la solicitud.")
    }
  }


  // Esto es lo que se permite usar desde cualquier otra parte de la aplicación.
  return { 
    // Datos que se pueden leer:
    misPrestamos, 
    equiposDisponibles,
    // Funciones que se pueden llamar:
    fetchMisPrestamos,
    fetchEquiposDisponibles,
    crearSolicitud
  }
})