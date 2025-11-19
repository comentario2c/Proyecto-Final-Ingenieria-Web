// Función principal de Pinia para crear un store
import { defineStore } from 'pinia'
// 'ref' se usa para crear variables reactivas (el state)
import { ref } from 'vue' 

// Flujo General del Store 
// Este store es el "cerebro" de la autenticación. Su único trabajo
// es guardar "QUIÉN" es el usuario que ha iniciado sesión.
// 1. La aplicación se inicia. El 'state' (usuario) es 'null' (nadie logueado).
// 2. El usuario va a 'login.vue' o 'register.vue'.
// 3. Después de un login/registro exitoso (con Google + nuestro Backend),
//     el componente de Vue llama a la acción 'setUser(datosUsuario)'.
// 4. El 'state' de 'usuario' ahora tiene los datos (ej. { rol: 'alumno', ... }).
// 5. TODOS los demás componentes (como Alumnos.vue o un Navbar)
//     pueden "mirar" este store para saber quién está conectado y reaccionar.
// 6. El usuario hace clic en "Cerrar Sesión".
// 7. Se llama a la acción 'clearUser()'.
// 8. El 'state' de 'usuario' vuelve a ser 'null', y la app lo redirige al login.

// Definición del Store 
// defineStore('auth', ...) crea el "cerebro" (store)
// con el ID único de 'auth'.
export const useAuthStore = defineStore('auth', () => {

  // STATE (El Estado o "La Memoria") 
  // El "state" son los datos que este cerebro va a guardar.
  // Es la "fuente única de verdad" sobre quién está logueado.

  // 'usuario' es la variable que guarda el objeto de usuario.
  // Inicia como 'null' porque al principio, nadie ha iniciado sesión.
  // (Ej: { ID_Usuario: 'uid_firebase_123', rol: 'alumno', nombre: 'Lucas' })
  const usuario = ref(null)

  // ACTIONS (Las Acciones o "Funciones") 
  /**
   * @nombre setUser
   * @desc Guarda los datos del usuario en el state.
   * @param {object} datosUsuario - El objeto de usuario que recibimos del backend.
   */
  function setUser(datosUsuario) {
    // Flujo de setUser:
    // Se llama desde login.vue o register.vue.
    // Reemplaza el 'null' (o el usuario anterior) con los nuevos datos.
    usuario.value = datosUsuario
  }

  /**
   * @nombre clearUser
   * @desc Limpia los datos del usuario al cerrar sesión.
   */
  function clearUser() {
    // Flujo de clearUser:
    // Se llama desde Alumnos.vue (botón "Cerrar Sesión").
    // Restablece el 'state' a 'null'.
    usuario.value = null
  }

  // RETURN (El Contrato)
  // Esto "publica" las variables del state y las funciones de las actions
  // para que cualquier componente (como Alumnos.vue o login.vue)
  // pueda importarlas y usarlas.
  return { 
    // State:
    usuario, 
    // Actions:
    setUser, 
    clearUser 
  }
}, {
    // --- ¡AQUÍ ESTÁ EL CAMBIO FINAL! ---
    // Le dice a Pinia que guarde este store en el LocalStorage del navegador
    persist: true, 
});