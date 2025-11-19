<template>
  <div class="flex min-h-screen bg-gray-50">
    <AdminSidebar />
    <div class="flex-1">
      <AdminNavbar />
      <main class="p-4">
        <RouterView /> <!-- 👈 aquí se renderiza EquiposView -->
      </main>
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from './AdminSidebar.vue'
import AdminNavbar from './AdminNavbar.vue'
</script>
