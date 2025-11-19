<template>
  <header class="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
    <h2 class="text-lg font-medium text-gray-700">Panel de Administración</h2>

    <button
      @click="logout"
      class="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50 transition"
    >
      Cerrar sesión
    </button>
  </header>
</template>

<script setup>
const logout = () => {
  alert('Cerrar sesión (lógica pendiente)')
}
</script>
