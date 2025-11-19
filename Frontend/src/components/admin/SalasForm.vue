<template>
  <div>
    <h2 class="text-lg font-semibold mb-2">{{ sala ? 'Editar Sala' : 'Nueva Sala' }}</h2>
    <form @submit.prevent="onSubmit">
      <div class="mb-2">
        <label class="block text-sm font-medium">Nombre de Sala</label>
        <input v-model="form.nombreSala" :disabled="sala" type="text" class="w-full border rounded p-1"/>
      </div>
      <div class="mb-2">
        <label class="block text-sm font-medium">Stock de Equipos</label>
        <input v-model.number="form.stockEquipos" type="number" class="w-full border rounded p-1"/>
      </div>
      <div class="mb-2">
        <label class="block text-sm font-medium">Descripción</label>
        <textarea v-model="form.descripcion" class="w-full border rounded p-1"></textarea>
      </div>
      <div class="flex justify-end mt-3">
        <button type="button" @click="$emit('cerrar')" class="mr-2 px-4 py-2 bg-gray-300 rounded">Cancelar</button>
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  sala: Object
});
const emit = defineEmits(['guardar', 'cerrar']);

const form = reactive({
  nombreSala: '',
  stockEquipos: 0,
  descripcion: ''
});

watch(() => props.sala, (newVal) => {
  if (newVal) Object.assign(form, newVal);
  else Object.assign(form, { nombreSala: '', stockEquipos: 0, descripcion: '' });
});

const onSubmit = () => {
  emit('guardar', { ...form });
};
</script>
