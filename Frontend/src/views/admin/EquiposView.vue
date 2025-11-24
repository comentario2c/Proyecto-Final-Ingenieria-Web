<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Gestión de Equipos</h1>

    <!-- Botón para agregar -->
    <button
      class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      @click="abrirModal(null)"
    >
      + Nuevo Equipo
    </button>

    <!-- Tabla de equipos -->
    <table class="w-full mt-6 border-collapse border border-gray-200 text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-3 py-2 text-left">ID</th>
          <th class="border px-3 py-2 text-left">Modelo</th>
          <th class="border px-3 py-2 text-left">N° Serie</th>
          <th class="border px-3 py-2 text-left">Estado</th>
          <th class="border px-3 py-2 text-left">Sala</th>
          <th class="border px-3 py-2 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="equipo in equipos" :key="equipo.ID_Equipo">
          <td class="border px-3 py-2">{{ equipo.ID_Equipo }}</td>
          <td class="border px-3 py-2">{{ equipo.modelo }}</td>
          <td class="border px-3 py-2">{{ equipo.numeroSerie }}</td>
          <td class="border px-3 py-2">{{ equipo.estado }}</td>
          <td class="border px-3 py-2">{{ equipo.nombreSala }}</td>
          <td class="border px-3 py-2 text-center">
            <button class="text-blue-600 hover:underline" @click="abrirModal(equipo)">Editar</button>
            <button class="text-red-600 hover:underline ml-3" @click="eliminarEquipo(equipo.ID_Equipo)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 🔹 Modal con animación -->
    <transition name="fade">
      <div
        v-if="mostrarModal"
        class="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
      >
        <!-- Contenido del modal -->
        <transition name="zoom">
          <div
            v-if="mostrarModal"
            class="bg-white rounded-2xl shadow-xl p-6 w-96 border border-gray-200"
          >
            <EquiposForm
              :equipo="equipoSeleccionado"
              @guardar="guardarEquipo"
              @cerrar="cerrarModal"
            />
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import EquiposForm from '../../components/admin/EquiposForm.vue'

const equipos = ref([])
const mostrarModal = ref(false)
const equipoSeleccionado = ref(null)

// Cargar datos de ejemplo
const API_URL = import.meta.env.VITE_API_URL + '/equipos' // cambia al puerto de tu backend

onMounted(async () => {
  await cargarEquipos()
})

const cargarEquipos = async () => {
  const res = await axios.get(API_URL)
  equipos.value = res.data
}

const guardarEquipo = async (nuevoEquipo) => {
  if (equipoSeleccionado.value) {
    await axios.put(`${API_URL}/${nuevoEquipo.ID_Equipo}`, nuevoEquipo)
  } else {
    await axios.post(API_URL, nuevoEquipo)
  }
  await cargarEquipos()
  cerrarModal()
}

const eliminarEquipo = async (id) => {
  await axios.delete(`${API_URL}/${id}`)
  await cargarEquipos()
}


// Abrir modal
const abrirModal = (equipo) => {
  equipoSeleccionado.value = equipo
  mostrarModal.value = true
}

// Cerrar modal
const cerrarModal = () => {
  mostrarModal.value = false
  equipoSeleccionado.value = null
}

</script>

<style>
/* --- Fondo del modal (animación de opacidad) --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- Zoom suave al abrir/cerrar modal --- */
.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.25s ease;
}
.zoom-enter-from {
  opacity: 0;
  transform: scale(0.9);
}
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
