<script setup>
    import { useLoginStore } from '../stores/login';
    import { useRouter } from 'vue-router';
    import { ref } from 'vue';

    const loginStore = useLoginStore();
    const router = useRouter();
    const rut = ref("");

    const usuario = {
        uid: loginStore.uid,
        nombre: loginStore.nombre,
        email: loginStore.email,
        rol: loginStore.rol
    }

    const rolDB = Object.freeze ({
        alumno: "alumno",
        profesor: "profesor",
        director: "director"
    })
    
    function esLoggeado(){
        if (loginStore.uid !== null && loginStore.token !== null){
            return true
        }

        if (loginStore.uid === null && loginStore.token === null){
            return false
        }
    }

    function registrarUsuario(rutValue) {
        // Llamada al backend para registrar el usuario
        return router.push("/alumno")
    }

    if (!esLoggeado()) {
        router.push("/")
    }

    const handleSubmit = () => {
        const rutValue = rut.value

        if(esLoggeado() === true && usuario.rol === rolDB.alumno){
            registrarUsuario(rutValue);
            return router.push("/alumno")
        }

        if(esLoggeado() === true && usuario.rol === rolDB.profesor){
            registrarUsuario(rutValue);
            return router.push("/profesor")
        }

        if(esLoggeado() === true && usuario.rol === rolDB.director){
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
            <form class="form flex flex-col items-center" @submit.prevent="handleSubmit">
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