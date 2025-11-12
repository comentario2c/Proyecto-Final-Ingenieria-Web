<script setup>
// 'ref' se usa para crear variables reactivas (el state) para el v-model
import { ref } from 'vue';
// Herramientas de Firebase para la autenticación con Google
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
// 'useRouter' es la herramienta de Vue para redirigir al usuario a otras páginas
import { useRouter } from 'vue-router';
// 'useAuthStore' es nuestro "cerebro" (store) de Pinia para guardar el usuario
import { useAuthStore } from '../stores/authStore.js';
// 'axios' es el "cartero" para llamar a nuestro backend (Express)
import { default as axios } from 'axios';

// Flujo General del Codigo 
// Este archivo es la página de "Registro". Combina la entrada de
// datos del usuario (RUT) con la autenticación de Google.
// 1. La aplicación se inicia y el usuario navega a '/register'.
// 2. El usuario escribe su RUT en el campo de texto <input>.
//    - Este campo está conectado a la variable 'rut' (state) vía 'v-model'.
// 3. El usuario hace clic en el botón "Registrarme con Google".
// 4. El <form> detecta el 'submit' y, gracias a '@submit.prevent',
//    evita que la página se recargue y en su lugar llama a la función 'handleRegister'.
// 5. La función 'handleRegister' ejecuta la lógica principal:
//    5.1 Valida que el RUT no esté vacío.
//    5.2 "Limpia" el RUT (quita puntos y guion) para que coincida con la BD (varchar(9)).
//    5.3 Valida que el RUT limpio no sea demasiado largo.
//    5.4 Llama a 'signInWithPopup' para que el usuario se autentique con Google.
//    5.5 Recopila TODOS los datos: (UID, correo, nombre) de Google + (RUT limpio) del formulario.
//    5.6 Llama a nuestro backend (POST /api/auth/register) y le envía los 'datosRegistro'.
//    5.7 El backend (router/auth.js) valida el correo, crea el usuario en MySQL y devuelve el usuario.
//    5.8 'handleRegister' recibe el usuario, lo guarda en Pinia (authStore.setUser).
//    5.9 Redirige al usuario al 'Portal de Alumno' (/alumnos).
// 6. Si cualquier paso del 5.4 al 5.8 falla, el bloque 'catch' captura el
//    error y le muestra una alerta al usuario.

// INICIALIZACIÓN 
// Variable reactiva (state) para guardar el RUT del input (v-model).
const rut = ref(''); 
// Herramienta para redirigir al usuario (ej. router.push('/alumnos')).
const router = useRouter(); 
// "Cerebro" (store) de Pinia para guardar el usuario después del registro.
const authStore = useAuthStore(); 
// Inicializa el servicio de autenticación de Firebase.
const auth = getAuth(); 
// Crea un "proveedor" de Google (la ventana pop-up).
const googleProvider = new GoogleAuthProvider(); 

// Configura el "cartero" (axios) para que sepa la dirección de nuestro backend
const apiClient = axios.create({ 
  baseURL: 'http://localhost:3000/api' 
});

// FUNCIÓN DE REGISTRO
/**
 * @nombre handleRegister
 * @desc Función principal que se activa al enviar el formulario de registro.
 */
const handleRegister = async () => {
  // Flujo de handleRegister:
  // Validar que el RUT no esté vacío.
  if (!rut.value) {
    alert("Por favor, ingresa tu RUT.");
    return; // Detiene la función aquí
  }

  // Limpiar el RUT: quitar puntos (.) y guion (-).
  // Ej: "12.345.678-9" se convierte en "123456789"
  const rutLimpio = rut.value.replace(/\./g, '').replace(/-/g, '');

  // Validar el largo (debe ser varchar(9) en la BD).
  if (rutLimpio.length > 9) {
      alert("El RUT ingresado es demasiado largo. Por favor, revísalo (sin puntos y con guion).");
      return; // Detiene la función aquí
  }

  // Iniciar bloque 'try' para capturar errores de Firebase o del Backend
  try {
    // PRIMERO: Autenticamos con Google (abre el pop-up).
    const result = await signInWithPopup(auth, googleProvider);
    
    // SI ES EXITOSO: Recopilamos TODOS los datos para el backend.
    const datosRegistro = {
      uid: result.user.uid, // El ID único de Firebase (nuestro ID_Usuario)
      correo: result.user.email,
      nombre: result.user.displayName,
      rut: rutLimpio // <-- IMPORTANTE: Enviamos el RUT limpio
    };

    // SEGUNDO: Llamamos a nuestro backend (router/auth.js)
    // con el endpoint 'POST /api/auth/register'.
    const response = await apiClient.post('/auth/register', datosRegistro);

    // TERCERO: Guardamos el usuario que el backend nos devolvió
    // en el "cerebro" (Pinia).
    authStore.setUser(response.data); 
    // CUARTO: Redirigimos al usuario al Portal de Alumno.
    router.push('/alumnos'); 

  } catch (error) {
    // MANEJO DE ERRORES: Si algo en el 'try' falla (Firebase o el backend).
    // Mostrar el error en la consola para depuración.
    console.error("Error en el registro:", error);
    // Mostrar un error simple al usuario.
    alert("Error al registrar: " + error.message);
  }
};
</script>

<template>
  <div class="p-8 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">Registro de Usuario</h1>
    <p class="text-gray-600 mb-6">Por favor rellena tus datos. El registro se completará con tu cuenta de Google.</p>

    <form @submit.prevent="handleRegister">
      <div class="mb-4">
        <label for="rut" class="block text-sm font-medium text-gray-700">Tu RUT (con guion)</label>
        <input 
          id="rut"
          v-model="rut" 
          type="text"
          placeholder="12345678-9"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <button type="submit" class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
        Registrarme con Google
      </button>
    </form>
  </div>
</template>