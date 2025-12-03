<template>

 <div class="p-6 bg-white rounded-lg shadow-lg max-w-lg mx-auto">

  <h2 class="text-2xl font-semibold mb-4 text-gray-800">

   {{ props.equipo ? "Editar Equipo" : "Registrar Equipo" }}

  </h2>

  

  <form @submit.prevent="guardar">

   <div class="mb-4">

    <label class="block text-gray-700">ID Equipo</label>

    <input v-model="form.ID_Equipo" type="text" class="w-full p-2 border rounded" :disabled="props.equipo" required />

   </div>

  

   <div class="mb-4">

    <label class="block text-gray-700">Modelo</label>

    <input v-model="form.modelo" type="text" class="w-full p-2 border rounded" required />

   </div>

  

   <div class="mb-4">

    <label class="block text-gray-700">Número de Serie</label>

    <input v-model="form.numeroSerie" type="text" class="w-full p-2 border rounded" />

   </div>

  

   <div class="mb-4">

    <label class="block text-gray-700">Estado</label>

    <select v-model="form.estado" class="w-full p-2 border rounded">

     <option>Disponible</option>

     <option>En uso</option>

     <option>En mantenimiento</option>

    </select>

   </div>

  

   <div class="mb-4">

    <label class="block text-gray-700">Sala</label>

    <select v-model="form.nombreSala" class="w-full p-2 border rounded" required>

     <option disabled value="">Seleccione una sala</option>

     <option v-for="sala in salas" :key="sala.nombreSala" :value="sala.nombreSala">

      {{ sala.nombreSala }}

     </option>

    </select>

   </div>

  

   <div class="flex justify-end space-x-2">

    <button type="button" @click="$emit('cerrar')" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">

     Cancelar

    </button>

    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">

     Guardar

    </button>

   </div>

  </form>

 </div>

</template>

  

<script setup>

import { ref, onMounted, watch } from "vue";

import axios from "axios";

  

const props = defineProps({

 equipo: Object

});

  

const emit = defineEmits(["guardar", "cerrar"]);

  

const form = ref({

 ID_Equipo: "",

 modelo: "",

 numeroSerie: "",

 estado: "Disponible",

 nombreSala: "",

 activo: 1

});

  

const salas = ref([]);

  

const cargarSalas = async () => {

 try {

  const response = await axios.get(import.meta.env.VITE_API_URL + "/salas");

  salas.value = response.data;

 } catch (error) {

  console.error("Error al cargar salas:", error);

 }

};

  

// 🔹 Cuando cambie el equipo seleccionado, actualizar formulario

watch(

 () => props.equipo,

 (nuevo) => {

  if (nuevo) {

   form.value = { ...nuevo };

  } else {

   form.value = {

    ID_Equipo: "",

    modelo: "",

    numeroSerie: "",

    estado: "Disponible",

    nombreSala: "",

    activo: 1

   };

  }

 },

 { immediate: true }

);

  

onMounted(() => {

 cargarSalas();

});

  

const guardar = () => {

 emit("guardar", form.value);

};

</script>