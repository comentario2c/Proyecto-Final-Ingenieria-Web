<script setup>
    import { useLoginStore } from '../stores/login';
    import { useRouter } from 'vue-router';
    import { ref } from 'vue';
    import axios from 'axios';

    const loginStore = useLoginStore();
    const router = useRouter();
    const rut = ref("");

    const usuario = {
        uid: loginStore.uid,
        token: loginStore.token
    }

    const db_rol = {
        alu: "alumno",
        pro: "profesor",
        adm: "admin"
    }
    
    function esLoggeado(){
        if (loginStore.uid !== null && loginStore.token !== null){
            return true
        }

        if (loginStore.uid === null && loginStore.token === null){
            return false
        }
    }

    function registrarUsuario(rutValue) {
        axios.post(import.meta.env.VITE_API_URL + "/register", {
            rut: rutValue,
            uid: usuario.uid,
            token: usuario.token
        }).then(response => {
            if (response.data.success === true){
                return;
            }
            else {
                alert("Error al registrar usuario")
            }
        }).catch(error => {
            alert("Error al registrar usuario" + error)
        })
        return;
    }

    if (!esLoggeado()) {
        router.push("/")
    }

    const enviarForm = () => {
        const rutValue = rut.value

        if(esLoggeado() === true && usuario.rol === db_rol.alu){
            registrarUsuario(rutValue);
            return router.push("/alumno")
        }

        if(esLoggeado() === true && usuario.rol === db_rol.pro){
            registrarUsuario(rutValue);
            return router.push("/profesor")
        }

        if(esLoggeado() === true && usuario.rol === db_rol.adm){
            registrarUsuario(rutValue);
            return router.push("/director")
        }

        else {
            alert("No has iniciado sesion correctamente")
            return router.push("/")
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
            <button class="bg-blue-700 text-white py-2 rounded-lg w-64 md:w-80 hover:bg-blue-800 hover:scale-105 transition duration-300">
                Registrarse
            </button>
            </form>
        </div>
    </div>
</template>