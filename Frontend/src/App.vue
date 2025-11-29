<script setup>
  import { useLoginStore } from './stores/login.js'
  import { useRouter } from 'vue-router';
  import { onMounted } from 'vue';

  const loginStore = useLoginStore();
  const router = useRouter();

  onMounted(() => {
    if (loginStore.token === null || loginStore.token === undefined) {
      router.push('/')
    }
  })
</script>

<template>
  <main>
    <RouterView></RouterView>
  </main>
</template>
