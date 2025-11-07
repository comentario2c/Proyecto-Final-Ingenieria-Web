<script setup>
    import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';

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

    function esExistente(uidUser, email, nombre, rol) {
        // Consultar a la base de datos si hay un usuario con la uid
        
        // if si la consulta devuelve true no debe hacer nada
        // if si la consulta devuelve false toma los datos del usuario y hace un insert para el registro
    }

    function obtenerRol(email, nombre){
        // -- email --
        // Separar email direccion@dominio
        const direccion = email.split("@")[0]
        const dominio = email.split("@")[1]

        // -- nombre --
        let nombreApellido = nombre.split(" ")[0] + nombre.split(" ")[2]
        nombreApellido = nombreApellido.toLowerCase()

        // Comparaciones
        const esAlumno = dominio === rol_type.alumno // && nombreApellido === direccion - no se si tiene sentido
        const esProfesor = dominio === rol_type.profesor
        const esDirector = direccion.slice(0,3) === rol_type.director && dominio === rol_type.profesor

        // Devolver
        if (esAlumno === true){
            // falta la redirección a el menú de alumno y retornar una variable que contenga 
            // el rol para luego almacenarla en la base de datos con esExistente()
            return console.log("El usuario es un estudiante")
        }
        
        if(esProfesor === true){
            return console.log("El usuario es un profesor")
        }
        
        if(esDirector === true){
            return console.log("Es un director")
        }
        
        if(dominio !== rol_type.alumno && dominio !== rol_type.profesor) {
            return alert("El correo utilizado para la autenticacion no pertenece a la organización, porfavor utilice un corrreo institucional")
        }

        else {
            return alert("error desconocido")
        }
    }

    const loginGoogle = () => {
        signInWithPopup(auth, googleProvider)
        .then((result) =>{
            obtenerRol(result.user.email, result.user.displayName, result.user.uid)
        })
        .catch((error) => {
            alert("Error al inciar sesion con google" + error)
        })
    }
</script>

<template>
    <button @click="loginGoogle()">Loggin con google</button>
</template>