<script setup>
    import { GoogleAuthProvider, getAuth, getRedirectResult, signInWithCredential, signInWithPopup, signInWithRedirect } from 'firebase/auth';
    import { RouterLink, useRouter } from 'vue-router';
    import { useLoginStore } from '../store/login';
    import { onMounted } from 'vue';

    // Flujo
    // 1. El usuario se loggea -- Boton creado
    // 2. Se identifica si es alumno, profesor o director de carrera -- obtenerRol()
    //  2.1 Si es alumno debe de entregar el token y redirigirlo a su menú correspondiente 
    //  2.2 Si es profesor debe de entregar el toekn y redirigirlo a su menú correspondiente
    //  2.3 Si es director debe de entregar el token y redirigirlo a su menú correspondiente
    //  2.4 Si no cumple con las condiciones anteriores manejar el error
    // 3. Preguntar a la DB ¿El usuario existe? -- esExistente()
    //  3.1 Si existe no hacer nada
    //  3.2 Si no existe crear el usuario en la DB guardando el UID de firebase, nombre, correo y rol
    // 4. Si algo falla en la autenticacion de google manejar el error

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

        // -- nombre --
        let nombreApellido = nombre.split(" ")[0] + nombre.split(" ")[2]
        nombreApellido = nombreApellido.toLowerCase()

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

        if (esExistente() === false){
            return alert("Es tu primera vez en esta app, Registrate!")
        }

        else {
            return alert("error desconocido")
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