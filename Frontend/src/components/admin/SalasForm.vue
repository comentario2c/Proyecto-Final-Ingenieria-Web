<template>

 <div>

  <h2 class="text-lg font-semibold mb-2">

   {{ modoEditar ? "Editar Sala" : "Nueva Sala" }}

  </h2>

  

  <form @submit.prevent="onSubmit">

   <!-- NombreSala -->

   <div class="mb-2">

    <label class="block text-sm font-medium">Nombre de Sala</label>

    <input

     v-model="form.nombreSala"

     type="text"

     class="w-full border rounded p-1"

     :disabled="modoEditar"

    />

   </div>

  

   <!-- Stock -->

   <div class="mb-2">

    <label class="block text-sm font-medium">Stock de Equipos</label>

    <input

     v-model.number="form.stockEquipos"

     type="number"

     class="w-full border rounded p-1"

    />

   </div>

  

   <!-- Descripción -->

   <div class="mb-2">

    <label class="block text-sm font-medium">Descripción</label>

    <textarea

     v-model="form.descripcion"

     class="w-full border rounded p-1"

    ></textarea>

   </div>

  

   <!-- Botones -->

   <div class="flex justify-end mt-3">

    <button

     type="button"

     @click="$emit('cerrar')"

     class="mr-2 px-4 py-2 bg-gray-300 rounded"

    >

     Cancelar

    </button>

  

    <button

     type="submit"

     class="px-4 py-2 bg-blue-600 text-white rounded"

    >

     Guardar

    </button>

   </div>

  </form>

 </div>

</template>

  

<script setup>

import { reactive, watch, computed } from "vue";

  

const props = defineProps({

 sala: {

  type: Object,

  default: null

 }

});

  

const emit = defineEmits(["guardar", "cerrar"]);

  

// formulario reactivo

const form = reactive({

 nombreSala: "",

 stockEquipos: 0,

 descripcion: ""

});

  

// detectar si estamos editando

const modoEditar = computed(() => props.sala !== null);

  

// llenar formulario cuando cambie sala

watch(

 () => props.sala,

 (nuevaSala) => {

  if (nuevaSala) {

   form.nombreSala = nuevaSala.nombreSala;

   form.stockEquipos = nuevaSala.stockEquipos;

   form.descripcion = nuevaSala.descripcion;

  } else {

   form.nombreSala = "";

   form.stockEquipos = 0;

   form.descripcion = "";

  }

 },

 { immediate: true } // 🔥 importante: carga los datos al abrir el modal

);

  

// enviar datos al padre

const onSubmit = () => {

 emit("guardar", { ...form });

};

</script>