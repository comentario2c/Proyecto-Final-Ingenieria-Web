<template>

 <div class="p-6">

  <h1 class="text-2xl font-semibold mb-4">Gestión de Equipos</h1>

  <button

   @click="abrirModal(null)"

   class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"

  >

   + Nuevo Equipo

  </button>

  

  <table class="w-full mt-6 border-collapse border border-gray-200 text-sm">

   <thead class="bg-gray-100">

    <tr>

     <th class="border px-3 py-2">ID</th>

     <th class="border px-3 py-2">Modelo</th>

     <th class="border px-3 py-2">N° Serie</th>

     <th class="border px-3 py-2">Estado</th>

     <th class="border px-3 py-2">Sala</th>

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

      <button @click="abrirModal(equipo)" class="text-blue-600 hover:underline">Editar</button>

      <button @click="eliminarEquipo(equipo.ID_Equipo)" class="text-red-600 hover:underline ml-3">Eliminar</button>

     </td>

    </tr>

   </tbody>

  </table>

  

  <!-- Modal -->

  <div

   v-if="mostrarModal"

   class="fixed inset-0 flex items-center justify-center bg-black/40 z-50"

  >

   <div class="bg-white rounded-2xl shadow-xl p-6 w-96 border border-gray-200">

    <EquiposForm

     :equipo="equipoSeleccionado"

     @guardar="guardarEquipo"

     @cerrar="cerrarModal"

    />

   </div>

  </div>

 </div>

</template>

  

<script setup>

import axios from "axios";

import { ref, onMounted } from "vue";

import EquiposForm from "../../components/admin/EquiposForm.vue";

  

const equipos = ref([]);

const mostrarModal = ref(false);

const equipoSeleccionado = ref(null);

  

const API_URL = "http://localhost:3000/api/equipos";

  

const cargarEquipos = async () => {

 try {

  const res = await axios.get(API_URL);

  equipos.value = res.data;

 } catch (err) {

  console.error("Error cargando equipos:", err);

 }

};

  

onMounted(cargarEquipos);

  

const abrirModal = (equipo) => {

 equipoSeleccionado.value = equipo ? { ...equipo } : null;

 mostrarModal.value = true;

};

  

const cerrarModal = () => {

 mostrarModal.value = false;

 equipoSeleccionado.value = null;

};

  

const guardarEquipo = async (equipo) => {

 try {

  if (equipoSeleccionado.value) {

   await axios.put(`${API_URL}/${equipo.ID_Equipo}`, equipo);

  } else {

   await axios.post(API_URL, equipo);

  }

  cargarEquipos();

  cerrarModal();

 } catch (err) {

  console.error("Error guardando equipo:", err);

 }

};

  

const eliminarEquipo = async (id) => {

 try {

  await axios.delete(`${API_URL}/${id}`);

  cargarEquipos();

 } catch (err) {

  console.error("Error eliminando equipo:", err);

 }

};

</script>

  

<style>

.fade-enter-active,

.fade-leave-active {

 transition: opacity 0.3s ease;

}

.fade-enter-from,

.fade-leave-to {

 opacity: 0;

}

  

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