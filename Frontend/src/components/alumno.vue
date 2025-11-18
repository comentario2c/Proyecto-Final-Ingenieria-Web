<script setup>
    import { useLoginStore } from '../store/login';
    const loginStore = useLoginStore();

    console.log("token:", loginStore.token)
</script>

<template>
    <h1>Bienvenido a la vista de alumno</h1>
</template>