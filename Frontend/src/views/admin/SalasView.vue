<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Gestión de Salas</h1>

    <button @click="abrirModal(null)" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      + Nueva Sala
    </button>

    <table class="w-full mt-6 border border-gray-200 text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-3 py-2">Nombre</th>
          <th class="border px-3 py-2">Stock Equipos</th>
          <th class="border px-3 py-2">Descripción</th>
          <th class="border px-3 py-2 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sala in salas" :key="sala.nombreSala">
          <td class="border px-3 py-2">{{ sala.nombreSala }}</td>
          <td class="border px-3 py-2">{{ sala.stockEquipos }}</td>
          <td class="border px-3 py-2">{{ sala.descripcion }}</td>
          <td class="border px-3 py-2 text-center">
            <button @click="abrirModal(sala)" class="text-blue-600 hover:underline">Editar</button>
            <button @click="eliminarSala(sala.nombreSala)" class="text-red-600 hover:underline ml-2">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <transition name="fade">
      <div v-if="mostrarModal" class="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
        <transition name="zoom">
          <div class="bg-white rounded-2xl shadow-xl p-6 w-96 border border-gray-200">
            <SalasForm :sala="salaSeleccionada" @guardar="guardarSala" @cerrar="cerrarModal" />
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import SalasForm from '../../components/admin/SalasForm.vue';

const salas = ref([]);
const mostrarModal = ref(false);
const salaSeleccionada = ref(null);

const API_URL = 'http://localhost:3000/api/salas';

onMounted(async () => {
  await cargarSalas();
});

const cargarSalas = async () => {
  try {
    const res = await axios.get(API_URL);
    salas.value = res.data;
  } catch (err) {
    console.error("Error cargando salas:", err);
  }
};

const abrirModal = (sala) => {
  salaSeleccionada.value = sala;
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
  salaSeleccionada.value = null;
};

const guardarSala = async (sala) => {
  try {
    if (salaSeleccionada.value) {
      await axios.put(`${API_URL}/${sala.nombreSala}`, sala);
    } else {
      await axios.post(API_URL, sala);
    }
    await cargarSalas();
    cerrarModal();
  } catch (err) {
    console.error("Error guardando sala:", err);
  }
};

const eliminarSala = async (nombreSala) => {
  try {
    await axios.delete(`${API_URL}/${nombreSala}`);
    await cargarSalas();
  } catch (err) {
    console.error("Error eliminando sala:", err);
  }
};
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.zoom-enter-active, .zoom-leave-active { transition: all 0.25s ease; }
.zoom-enter-from { opacity:0; transform: scale(0.9); }
.zoom-leave-to { opacity:0; transform: scale(0.9); }
</style>
