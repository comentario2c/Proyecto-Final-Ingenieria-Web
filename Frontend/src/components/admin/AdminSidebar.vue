<template>
  <aside class="w-60 bg-white border-r border-gray-200 flex flex-col">
    <div class="p-6 border-b border-gray-200">
      <h1 class="text-xl font-semibold text-gray-700">Control CP</h1>
      <p class="text-sm text-gray-400 mt-1">Administrador</p>
    </div>

    <nav class="flex-1 px-4 py-6 space-y-2">
      <RouterLink
        to="/admin"
        class="block rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
        active-class="bg-gray-100 text-gray-900 font-medium"
      >
        Dashboard
      </RouterLink>

      <RouterLink
        to="/admin/equipos"
        class="block rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
        active-class="bg-gray-100 text-gray-900 font-medium"
      >
        Equipos
      </RouterLink>

      <RouterLink
        to="/admin/salas"
        class="block rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
        active-class="bg-gray-100 text-gray-900 font-medium"
      >
        Salas
      </RouterLink>
    </nav>
  </aside>
</template>
