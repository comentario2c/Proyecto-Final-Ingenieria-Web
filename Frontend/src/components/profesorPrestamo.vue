<script setup>
  import { useScanStore } from '../stores/scanStore';
  import Scaner from './scanerDynamsoft.vue'; // Componente hijo
  import axios from 'axios';

  const store = useScanStore();

  // Mientras no se llenen todos los campos no se puede enviar el prestamo
  const enviarPrestamo = async () => {
    if (!store.rutUsuario || !store.idEquipo) {
      alert("Faltan datos");
      return;
    }
    
    // aviso al usuario del envio de datos
    axios.post(import.meta.env.VITE_API_URL + "/prestamos", {
      rutUsuario: store.rutUsuario,
      idEquipo: store.idEquipo
    }).then((response) => {
      alert(response.data.message);
    }).catch((error) => {
      alert(error.response.data.error);
    })
    store.resetForm();
  };

  async function enviarDevolucion() {
    if (!store.idDevolucion) {
      alert("Faltan datos");
      return;
    }
    
    // aviso al usuario del envio de datos
    axios.post(import.meta.env.VITE_API_URL + "/devolucion", {
      idDevolucion: store.idDevolucion
    }).then((response) => {
      alert(response.data.message);
    }).catch((error) => {
      alert(error.response.data.error);
    })
    store.resetForm();
  }
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-md rounded-xl shadow-lg p-6 space-y-6">
      <h1 class="text-2xl font-bold text-gray-800 text-center">Nuevo Préstamo</h1>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Identificación Usuario (RUT)</label>
        <div class="flex gap-2">
          <input 
            v-model="store.rutUsuario" 
            type="text" 
            required
            placeholder="123456789"
            class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
          <button 
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            title="Escanear RUT"
            @click="store.abrirScanner('rut')"
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
            v-model="store.idEquipo" 
            type="text" 
            required
            placeholder="PC-LAB-04"
            class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none transition"
          />
          <button 
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            title="Escanear Equipo"
            @click="store.abrirScanner('equipo')"
          >
          <!-- svg obtenidos de fonts.google -->
          <img src="/camara.svg" />
          </button>
        </div>
      </div>

      <button 
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition active:scale-95"
        @click="enviarPrestamo"
      >
        Registrar Préstamo
      </button>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 mt-5">Código del Equipo</label>
        <div class="flex gap-2">
          <input 
            v-model="store.idDevolucion" 
            type="text" 
            required
            placeholder="PC-LAB-04"
            class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
          <button 
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            title="Escanear Equipo"
            @click="store.abrirScanner('devolucion')"
          >
          <!-- svg obtenidos de fonts.google -->
          <img src="/camara.svg" />
          </button>
        </div>
      </div>

      <button 
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition active:scale-95"
        @click="enviarDevolucion()"
        >
        Devolución
      </button>

    </div>

    <div v-if="store.mostrarScanner" class="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
      
      <button 
        class="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 rounded-full p-2 z-50"
        @click="store.cerrarScanner"
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