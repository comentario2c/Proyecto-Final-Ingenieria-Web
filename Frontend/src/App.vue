<script setup>
  import { useLoginStore } from './stores/login.js'
  import { useRouter } from 'vue-router';
  import { onMounted } from 'vue';

  // Inicializar store y ruteo
  const loginStore = useLoginStore();
  const router = useRouter();

  // Validar la sesion al cargar la app
  onMounted(() => {
    if (loginStore.token === null || loginStore.token === undefined) {
      router.push('/')
    }
  })

  // Redireccionar segun el rol y no permitir acceso a rutas no autorizadas
  switch (loginStore.rol){
    case "alumno":
      router.push('/alumnos')
      break;
    case "profesor":
      router.push('/profesores')
      break;
    case "admin":
      router.push('/admin')
      break;
    default:
      router.push('/') // si no hay rol, redirigir al login
      break;
  }
</script>

<template>
  <main>
    <RouterView></RouterView>
  </main>
</template>
