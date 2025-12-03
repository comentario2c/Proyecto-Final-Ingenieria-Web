<script setup>
    import { useLoginStore } from '../../stores/login';
    import { useRouter } from 'vue-router';
    import { ref } from 'vue';
    import axios from 'axios';

    // Inicializar store, ruteo y rut reactivo
    const loginStore = useLoginStore();
    const router = useRouter();
    const rut = ref("");

    // Creacion de objetos para el envio de datos
    const usuario = {
        uid: loginStore.uid,
        token: loginStore.token
    }

    const db_rol = {
        alu: "alumno",
        pro: "profesor",
        adm: "admin"
    }
    
    // preguntamos si el usuario está loggeado
    function esLoggeado(){
        if (loginStore.uid !== null && loginStore.token !== null){
            return true
        }

        if (loginStore.uid === null && loginStore.token === null){
            return false
        }
    }
    // Si no esta loggeado redirigimos al login
    if (!esLoggeado()) {
        router.push("/")
    }

    // Enviamos el rut, el uid y el token para completar el registro
    // y ademas realizar las validaciones correspondientes
    async function registrarUsuario(rutValue) {
        try {
            const response = await axios.post(import.meta.env.VITE_API_URL + "/register", {
                rut: rutValue,
                uid: usuario.uid,
                token: usuario.token
            });
            return response.data;
        } catch (error) {
            let mensajeError = "Error desconocido";

            // validaciones de errores
            if (error.response) {
                mensajeError = error.response.data.message || error.response.statusText;
            } else if (error.request) {
                mensajeError = "No se pudo conectar con el servidor";
            } else {
                mensajeError = error.message;
            }

            alert("Error: " + mensajeError);
            
            throw error; 
        }
    }

    // Función principal, enviamos el rut, el uid y el token para completar el registro
    // y redirigir al usuario a su respectiva pantalla
    const enviarForm = async () => {
        const rutValue = rut.value

        if (!rutValue) return alert("Ingresa un RUT");

        try {
            await registrarUsuario(rutValue);

            const userRol = loginStore.rol; // obtener el rol del store (actualizado en el login)

            if (userRol === db_rol.alu) {
                await router.push("/alumnos");
            } 
            else if (userRol === db_rol.pro) {
                await router.push("/profesores");
            } 
            else if (userRol === db_rol.adm) {
                await router.push("/admin");
            } 
            else {
                console.error("Rol no reconocido:", userRol);
                alert("Registro exitoso, Rol no reconocido");
                await router.push("/");
            }
        } catch (error) {
            alert("Error al registrar usuario" + error);
        }
    }
</script>

<template>
    <div class="flex flex-col items-center place-content-center h-screen">

        <div class="bg-gray-100 p-10 md:p-16 rounded-lg shadow-xl">
            <form class="form flex flex-col items-center" @submit.prevent="enviarForm">
            <h1 class="text-2xl font-semibold text-gray-800 pb-2 text-center">
                Si es tu primera vez por aquí...
            </h1>
            <p class="text-base text-gray-500 pb-6 text-center">
                Ingresa tu RUT para completar el registro
            </p>
            <input 
                id="rut"
                v-model="rut"
                type="text"
                placeholder="123456789"
                required
                class="px-4 py-2 mb-4 w-64 md:w-80 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button class="bg-blue-700 text-white py-2 rounded-lg w-64 md:w-80 hover:bg-blue-800 hover:scale-90 transition duration-300">
                Registrarse
            </button>
            </form>
        </div>
    </div>
</template>