// defineStore: Función principal de Pinia para crear un Store.
import { defineStore } from 'pinia'
// ref: Herramienta de Vue para crear una variable reactiva.
import { ref } from 'vue' 

// defineStore('auth', ) crea el Store y le asigna el ID único 'auth'.
// exporta la función 'useAuthStore' que se usa en los componentes para acceder a los datos.
export const useAuthStore = defineStore('auth', () => {

  // 'usuario' es la variable reactiva que contendrá el objeto del usuario logueado.
  // Inicia en 'null' porque no hay ninguna sesión activa por defecto.
  const usuario = ref(null)

  // Función para guardar los datos de un usuario que acaba de iniciar sesión.
  function setUser(datosUsuario) {
    // Actualiza el valor de la variable 'usuario' con los nuevos datos.
    usuario.value = datosUsuario
  }

  // Función para limpiar la sesión (cerrar sesión).
  function clearUser() {
    // Restablece la variable 'usuario' a 'null'.
    usuario.value = null
  }


  // Lo que se retorna es lo que estará disponible para usar en toda la aplicación.
  return { 
    // Se expone la variable de estado 'usuario'.
    usuario, 
    // Se exponen las funciones de acción 'setUser' y 'clearUser'.
    setUser, 
    clearUser 
  }
}, {
    // Esta opción de configurac|ión gracias al un plugin hace que:
    // Los datos de este Store se guarden automáticamente en el LocalStorage del navegador.
    // Esto mantiene la sesión del usuario iniciada incluso si se recarga la página.
    persist: true, 
});