<script setup>
    import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
    import { useLoginStore } from '../../stores/login.js'
    import { useRouter } from 'vue-router';
    import axios from 'axios';
    import { reactive } from 'vue';

    // Antes que nada, se espera que signInWithPopup funcione correctamente en el despliegue para usuarios 
    // que usen navegadores moviles, para que pueda obtener el token y el uid del usuario

    const googleProvider = new GoogleAuthProvider();
    const auth = getAuth();
    const router = useRouter();
    const loginStore = useLoginStore();

    // Objetos para evitar magic strings y evitar errores de tipeo
    const db_rol = {
        alu: "alumno",
        pro: "profesor",
        adm: "admin"
    }

    const msg_auth = {
        authTrue: "Autenticado",
        authFalse: "No autenticado",
        authError: "Error al autenticar",
        authFirst: "Primer inicio de sesion"
    }

    // objeto para almacenar la informacion del usuario reactivo
    const userInfo = reactive({
        usuario: '',
        email: '',
        uid: '',
        token: '' 
    })

    // Funcion para consultar el usuario en la base de datos
    const consultarUsuario = (token) => {
        axios.post(import.meta.env.VITE_API_URL + '/auth', {
            token: token // Necesita enviar el token para obtener el uid en el backend
        })
        .then(response => {
            switch (true) {
                // flujo de autenticacion
                // se pregunta ¿Es la primera vez que el usuario inicia sesion?
                // si es no, se obtienen los datos del usuario y se redirige a su respectiva pantalla
                // si es si, se redirige al registro para completar el rut
                case response.data.rol === db_rol.alu && response.data.message === msg_auth.authTrue:
                    loginStore.$patch({
                        token: userInfo.token,
                        rol: db_rol.alu,
                        uid: userInfo.uid,
                        usuario: userInfo.usuario
                    })
                    router.push("/alumnos")
                    break;
                case response.data.rol === db_rol.pro && response.data.message === msg_auth.authTrue:
                    loginStore.$patch({
                        token: userInfo.token,
                        rol: db_rol.pro,
                        uid: userInfo.uid,
                        usuario: userInfo.usuario
                    })
                    router.push("/profesores")
                    break;
                case response.data.rol === db_rol.adm && response.data.message === msg_auth.authTrue:
                    loginStore.$patch({
                        token: userInfo.token,
                        rol: db_rol.adm,
                        uid: userInfo.uid,
                        usuario: userInfo.usuario
                    })
                    router.push("/admin")
                    break;
                case response.data.rol === db_rol.alu && response.data.message === msg_auth.authFirst:
                    loginStore.$patch({
                        token: userInfo.token,
                        rol: db_rol.alu,
                        uid: userInfo.uid,
                        usuario: userInfo.usuario
                    })
                    router.push("/register")
                    break;
                case response.data.rol === db_rol.pro && response.data.message === msg_auth.authFirst:
                    loginStore.$patch({
                        token: userInfo.token,
                        rol: db_rol.pro,
                        uid: userInfo.uid,
                        usuario: userInfo.usuario
                    })
                    router.push("/register")
                    break;
                case response.data.rol === db_rol.adm && response.data.message === msg_auth.authFirst:
                    loginStore.$patch({
                        token: userInfo.token,
                        rol: db_rol.adm,
                        uid: userInfo.uid,
                        usuario: userInfo.usuario
                    })
                    router.push("/register")
                    break;
                case response.data.message === msg_auth.authFalse:
                    router.push("/")
                    break;
                default:
                    router.push("/")
                    break;
            }
        })
        .catch(error => {
            console.error("Error al obtener datos del usuario:", error)
            router.push("/")
        })
    }

    // Funcion para iniciar sesion con Google
    const loginGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider); // Iniciar sesion con Google
            const user = result.user;
            const token = await user.getIdToken(); // guardar el token

            // actualizar el userInfo con los datos del usuario de manera persistente
            userInfo.usuario = user.displayName;
            userInfo.email = user.email;
            userInfo.uid = user.uid;
            userInfo.token = token;

            consultarUsuario(token); // con los datos anteriores enviar el tokena al backend para consultar el usuario
        } catch (error) {
            console.error("Error al iniciar sesion con Google:", error);
        }
    }
</script>

<template>
    <div class="flex flex-col items-center md:p-16 place-content-center h-screen">
        <div class="flex flex-col items-center bg-gray-100 p-10 md:p-20 rounded-lg shadow-lg">
            <h1 class="pb-5 text-xl md:text-3xl">
            Bienvenido a Control de Prestamos
            </h1>
            <p class="text-xs px-4 py-2 mb-5 w-100 text-center md:w-100 sm:w-110">
            Registra prestamos de equipos de manera sencilla y rapida, inicia sesion con tu cuenta institucional para continuar
            </p>
            <button 
                class="bg-blue-700 text-white px-5 py-2 rounded-xl md:px-20 hover:scale-90 transition duration-300 cursor-pointer hover:bg-blue-600" 
                @click="loginGoogle()">
                <img src="/google.svg" class="inline-block" />
                Ingresar con Google 
            </button>
        </div>
    </div>
</template>