<script setup>
    import { getRedirectResult, signInWithRedirect, GoogleAuthProvider, getAuth } from 'firebase/auth';
    import { onMounted } from 'vue';

    const googleProvider = new GoogleAuthProvider();
    const auth = getAuth();

    const loginGoogle = async () => {
        try {
            await signInWithRedirect(auth, googleProvider);
        } catch (error) {
            alert("Error al redirigir: " + error.message); 
            console.error(error);
        }
    }

    onMounted(async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result) {
                const user = result.user;
                console.log(user)
            }
            else {
                console.log("No se recibió un usuario")
            }
        } catch(error) {
            alert("Error en la autenticacion con google: " + error.message)
        }
    })
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