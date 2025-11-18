<script setup>
    import { GoogleAuthProvider, getAuth, getRedirectResult, signInWithCredential, signInWithPopup, signInWithRedirect } from 'firebase/auth';
    import { RouterLink, useRouter } from 'vue-router';
    import { useLoginStore } from '../store/login';
    import { onMounted } from 'vue';

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
    const router = useRouter();
    const loginStore = useLoginStore();
    const signInWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);

    // Para evitar magic strings se usa un diccionario con los tipos de roles
    const rol_type = Object.freeze ({
        alumno: "alu.unach.cl",
        profesor: "unach.cl",
        director: "dir"
    })

    const rolDB = Object.freeze ({
        alumno: "alumno",
        profesor: "profesor",
        director: "director"
    })

    function esExistente() {
        // Consultar a la base de datos si hay un usuario con la uid
        // if si la consulta devuelve true no debe hacer nada
        // if si la consulta devuelve false toma los datos del usuario y hace un insert para el registro
        const esExistente = fetch("")

        if (esExistente === true){
            return router.push("/alumno")
        }

        if (esExistente === false){
            return router.push("/register")
        }
    }

    function obtenerRol(email, nombre, uid, token){
        // -- email --
        // Separar email direccion@dominio
        const direccion = email.split("@")[0]
        const dominio = email.split("@")[1]

            // Llamar a nuestro backend (Paso 3, 4, 5 y 6 del Flujo)
            // Llama al endpoint /api/auth/login que creamos en auth.js
            const response = await apiClient.post('/auth/login', { uid });

        // Comparaciones
        const esAlumno = dominio === rol_type.alumno // && esExistente(uid) === true // && nombreApellido === direccion - no se si tiene sentido
        const esProfesor = dominio === rol_type.profesor && esExistente(uid) === true
        const esDirector = direccion.slice(0,3) === rol_type.director && dominio === rol_type.profesor && esExistente(uid) === true
        let rol = "";
        
        // Devolver
        if (esAlumno === true){
            rol = rolDB.alumno;

            loginStore.$patch({
                nombre: nombre,
                email: email,
                uid: uid,
                token: token,
                rol: rol
            })

            return router.push("/register")
        }
        
        if(esProfesor === true){
            return console.log("El usuario es un profesor")
        }
        
        if(esDirector === true){
            return console.log("Es un director")
        }
        
        // Manejo de errores
        if(dominio !== rol_type.alumno && dominio !== rol_type.profesor) {
            return alert("El correo utilizado para la autenticacion no pertenece a la organización, porfavor utilice un corrreo institucional")
        }

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

    const loginGoogle = () => {
        signInWithPopup(auth, googleProvider)
        .then((result) =>{
            obtenerRol(result.user.email, result.user.displayName, result.user.uid, result.user.accessToken)
        })
        .catch((error) => {
            alert("Error al inciar sesion con google" + error)
        })
    }
</script>


<template>
    <div class="flex flex-col items-center md:p-16 place-content-center h-screen">
        <div class="flex flex-col items-center bg-gray-100 p-10 md:p-20 rounded-lg shadow-lg">
            <h1 class="pb-5 text-xl md:text-3xl">Bienvenido a Control de Prestamos</h1>
            <p class="text-xs px-4 py-2 mb-5 w-100 text-center md:w-100 sm:w-110">Registra prestamos de equipos de manera sencilla y rapida, inicia sesion con tu cuenta institucional para continuar</p>
            <button class="bg-blue-700 text-white px-5 py-2 rounded-xl md:px-20 hover:scale-105 transition duration-300" @click="loginGoogle()"><img src="/google.svg" class="inline-block"></img> Ingresar con Google</button>
        </div>
    </div>
</template>