<script setup>
  import { useScanStore } from '../stores/scanStore';
  import Scaner from './Scaner.vue'; // Componente hijo

  const store = useScanStore();

  // Mientras no se llenen todos los campos no se puede enviar el prestamo
  const enviarPrestamo = async () => {
    if (!store.rutUsuario || !store.idEquipo) {
      alert("Faltan datos");
      return;
    }
    
    // aviso al usuario del envio de datos
    alert(`Enviando Préstamo:\nRUT: ${store.rutUsuario}\nEquipo: ${store.idEquipo}`);
    store.resetForm();
  };
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    
    <div class="bg-white w-full max-w-md rounded-xl shadow-lg p-6 space-y-6">
      <h1 class="text-2xl font-bold text-gray-800 text-center">Nuevo Préstamo</h1>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Identificación Usuario (RUT)</label>
        <div class="flex gap-2">
          <input 
            type="text" 
            v-model="store.rutUsuario" 
            required
            placeholder="Ej: 12345678-9"
            class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
          <button 
            @click="store.abrirScanner('rut')"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            title="Escanear RUT"
          >
          <!-- svg obtenidos de fonts.google -->
          <img src="/camara.svg" /> 
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Código del Equipo</label>
        <div class="flex gap-2">
          <input 
            type="text" 
            v-model="store.idEquipo" 
            required
            placeholder="Ej: PC-LAB-04"
            class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none transition"
          />
          <button 
            @click="store.abrirScanner('equipo')"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            title="Escanear Equipo"
          >
          <!-- svg obtenidos de fonts.google -->
          <img src="/camara.svg" />
          </button>
        </div>
      </div>

      <button 
        @click="enviarPrestamo"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition active:scale-95 mt-4"
      >
        Registrar Préstamo
      </button>

    </div>

    <div v-if="store.mostrarScanner" class="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
      
      <button 
        @click="store.cerrarScanner"
        class="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 rounded-full p-2 z-50"
      >
        <!-- svg obtenidos de fonts.google -->
        <img src="/cerrar.svg" />
      </button>

      <div class="w-full max-w-2xl h-[60vh] bg-black border-2 border-gray-700 rounded-lg overflow-hidden relative">
        <Scaner @code-detected="store.procesarEscaneo" />
      </div>

      <p class="text-white mt-4 text-lg animate-pulse">
        Escaneando {{ store.campoObjetivo === 'rut' ? 'RUT de Usuario' : 'Código de Equipo' }}...
      </p>
    </div>

  </div>
</template>