<script setup>
    import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
    
    const loginGoogle = () => {
        signInWithPopup(auth, googleProvider)
        .then((result) =>{
            const uid = result.user.uid
            const correo = result.user.email
            const nombre = result.user.displayName
            const rut = document.getElementById("rut").value

            // metodo post al backend para crear el usuario

        })
        .catch((error) => {
            alert("Error al inciar sesion con google" + error)
        })
    }


</script>
<template>
    <h1>Por favor rellena tus datos y luego autenticate con google</h1>

    <form method="post">
        <p>Ingrese su rut</p>
        <input 
            type="number"
            placeholder="123456789"
            name="rut"
            required
         />

         <button type="submit" @click="loginGoogle">Registrarse</button>
    </form>
</template>