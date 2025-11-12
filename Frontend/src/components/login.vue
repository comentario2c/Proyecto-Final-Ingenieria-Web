<script setup>
    import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
    // Para redirigir
    import { useRouter } from 'vue-router';
    // Para guardar el usuario
    import { useAuthStore } from '../stores/authStore.js';
    // Para llamar al backend 
    import { default as axios } from 'axios'; 

    // Flujo 
    // 1. El usuario se loggea -- Boton creado (Llama a loginGoogle)
    // 2. El frontend (Vue) llama a Firebase y obtiene el UID (identificador único).
    // 3. El frontend envía ese UID a nuestro backend (Express) al endpoint /api/auth/login.
    // 4. El backend PREGUNTA A LA DB ¿El usuario existe? (¡La lógica de esExistente() está en el backend!)
    // 5. El backend determina el ROL (¡La lógica de obtenerRol() está en el backend!)
    // 6. El backend responde al frontend con los datos del usuario (incluyendo el rol).
    // 7. El frontend guarda el usuario en Pinia (authStore) y redirige al menú correspondiente.
    // 8. Si algo falla, se maneja el error.

    const router = useRouter();
    const authStore = useAuthStore();
    const apiClient = axios.create({ 
      baseURL: 'http://localhost:3000/api' 
    });

    const googleProvider = new GoogleAuthProvider();
    const auth = getAuth();

    // y los objetos 'rol_type' y 'rolDB' 
    // ¿Por qué? Porque como dice el "Flujo Corregido", toda esa lógica
    // de revisar el rol y la base de datos YA ESTÁ en tu backend 
    // (en el archivo 'Backend/router/auth.js', en el endpoint '/login').
    // No podemos tenerla en dos lugares.

    const loginGoogle = async () => {
        try {
            // El usuario se loggea (Paso 1 del Flujo)
            const result = await signInWithPopup(auth, googleProvider);
            const uid = result.user.uid; // (Paso 2 del Flujo)

            // Llamar a nuestro backend (Paso 3, 4, 5 y 6 del Flujo)
            // Llama al endpoint /api/auth/login que creamos en auth.js
            const response = await apiClient.post('/auth/login', { uid });

            // Si llegamos aquí, el backend encontró al usuario en MySQL
            const usuario = response.data; // (Contiene ID_Usuario, rol, nombre...)

            // Guardar en Pinia y Redirigir (Paso 7 del Flujo)
            authStore.setUser(usuario);

            if (usuario.rol === 'alumno') {
              router.push('/alumnos');
            } else if (usuario.rol === 'profesor') {
              router.push('/profesor'); // (Ruta para el futuro)
            } else if (usuario.rol === 'director') {
              router.push('/director'); // (Ruta para el futuro)
            } else {
              router.push('/'); // Si hay un problema, volver al login
            }

        } catch (error) {
            // (Paso 8 del Flujo)
            console.error("Error en el login:", error);
            
            // Manejo de errores (ej. si el usuario no está registrado)
            if (error.response?.status === 404) {
              // El backend nos dijo "404 - Usuario no encontrado"
              alert("Error: Usuario no encontrado. Por favor, ve a la página de registro.");
            } else {
              alert("Error al iniciar sesión: " + error.message);
            }
        }
    }
</script>


<template>
    <button class="" @click="loginGoogle()">Loggin con google</button>
    <router-link class="pl-5" to="/register">¿No te haz registrado?, haz click aqui.</router-link>
</template>