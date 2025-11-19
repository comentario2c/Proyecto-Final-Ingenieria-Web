// Función principal de Pinia para crear un store
import { defineStore } from 'pinia'
// 'ref' se usa para crear variables reactivas (el state)
import { ref } from 'vue'
//  Para llamar al backend 
import { default as axios } from 'axios' 

// Flujo General del Store
// 1. Un componente (ej. Alumnos.vue) necesita datos.
// 2. Llama a una 'Action' (función) de este store (ej. fetchMisPrestamos).
// 3. La 'Action' (función) llama al backend (Express) usando el 'apiClient'.
// 4. El backend consulta la base de datos (MySQL) y devuelve los datos (JSON).
// 5. La 'Action' recibe esos datos y los guarda en el 'State' (ej. misPrestamos.value = datos).
// 6. El componente (Alumnos.vue) está "escuchando" ese 'State' y, al ver que cambió,
//    se actualiza automáticamente para mostrar los nuevos datos.

// Configuración del "Cartero" (Axios) 
// Se crea una instancia de axios (apiClient) que ya sabe la dirección
// base de nuestro backend. Así no tenemos que escribir
// 'http://localhost:3000/api' en cada llamada.
const apiClient = axios.create({ 
  baseURL: 'http://localhost:3000/api' 
});

// Definición del Store 
// defineStore('prestamos', ...) crea un nuevo "cerebro" (store)
// con el ID único de 'prestamos'.
export const usePrestamosStore = defineStore('prestamos', () => {

  // STATE (El Estado o "La Memoria") 
  // El "state" son los datos que este cerebro va a guardar.
  // Usamos ref() para que sean "reactivos", es decir, que si
  // cambian, los componentes de Vue se actualicen solos.

  // Array para guardar la lista de "Mis Préstamos" (del alumno logueado)
  const misPrestamos = ref([])
  // Array para guardar la lista de "Equipos Disponibles"
  // (Esta la usaba el formulario que eliminamos de Alumnos.vue,
  // pero la dejamos aquí por si el "Director" la necesita)
  const equiposDisponibles = ref([])

  // ACTIONS (Las Acciones o "Las Funciones") 
  // Las "actions" son las funciones que pueden modificar el state.
  // Aquí es donde vive toda la lógica de llamar al backend.

  /**
   * @nombre fetchMisPrestamos
   * @desc Busca en la API (backend) todos los préstamos del usuario.
   * @param {string} idUsuario - El ID_Usuario (UID de Firebase) del alumno.
   */
  async function fetchMisPrestamos(idUsuario) {
    // Flujo de fetchMisPrestamos:
    // Revisar si nos dieron un ID. Si no (ej. 'null'), no hacer nada.
    if (!idUsuario) return; 

    try {
      // Llamar al endpoint del backend que creamos en 'router/prestamos.js'
      //    (Ej: GET http://localhost:3000/api/prestamos/usuario/fKhb00r8...)
      const response = await apiClient.get(`/prestamos/usuario/${idUsuario}`)
      
      // Si la llamada es exitosa, guardar los datos (el array de préstamos) en el state.
      //    El '.value' es necesario porque es un 'ref'.
      misPrestamos.value = response.data
    } catch (error) {
      // Si la llamada falla (ej. el backend se cayó), registrar el error
      //    en la consola y vaciar la lista para no mostrar datos viejos.
      console.error("Error al buscar préstamos:", error)
      misPrestamos.value = [] 
    }
  }

  /**
   * @nombre fetchEquiposDisponibles
   * @desc Busca en la API los equipos con estado 'disponible'.
   */
  async function fetchEquiposDisponibles() {
    // Flujo de fetchEquiposDisponibles:
    try {
      // Llamar al endpoint del backend que creamos en 'router/prestamos.js'
      //    (GET http://localhost:3000/api/prestamos/equipos-disponibles)
      const response = await apiClient.get('/prestamos/equipos-disponibles');
      
      // Guardar los datos REALES de la base de datos en el state.
      equiposDisponibles.value = response.data;

    } catch (error) {
      // Si falla, registrar el error y vaciar la lista.
      console.error("Error al buscar equipos disponibles:", error);
      equiposDisponibles.value = [];
    }
  }

  /**
   * @nombre crearSolicitud
   * @desc Envía una nueva solicitud de préstamo a la API.
   * (Esta función no se usa en Alumnos.vue, pero es para el futuro,
   * probablemente para la vista del Director/Administrador).
   * @param {object} datosSolicitud - Un objeto con { ID_Usuario, ID_Equipo, estado }
   */
  async function crearSolicitud(datosSolicitud) {
    try {
      // Temporalmente, solo mostraremos una alerta
      alert(`Solicitud enviada (simulación) para el equipo: ${datosSolicitud.ID_Equipo}`);

      // Flujo ideal:
      // Después de crear la solicitud, volvemos a cargar la lista
      // para que el usuario vea su nuevo préstamo en estado "pendiente"
      await fetchMisPrestamos(datosSolicitud.ID_Usuario)

    } catch (error) {
      console.error("Error al crear la solicitud:", error)
      alert("Error: No se pudo crear la solicitud.")
    }
  }

  // RETURN (El Contrato) 
  // Esto "publica" las variables del state y las funciones de las actions
  // para que cualquier componente (como Alumnos.vue) pueda importarlas y usarlas.
  return { 
    // State:
    misPrestamos, 
    equiposDisponibles,
    // Actions:
    fetchMisPrestamos,
    fetchEquiposDisponibles,
    crearSolicitud
  }
})