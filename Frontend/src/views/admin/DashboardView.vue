<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">Dashboard</h1>

    <div v-if="loading" class="text-gray-500">Cargando estadísticas...</div>

    <div v-else>
      <!-- Tarjetas principales -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- Equipos registrados -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-sm font-medium text-gray-500 mb-1">Equipos registrados</h3>
          <p class="text-3xl font-bold text-gray-800">{{ datos.equiposRegistrados }}</p>
        </div>

        <!-- Salas registradas -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-sm font-medium text-gray-500 mb-1">Salas registradas</h3>
          <p class="text-3xl font-bold text-gray-800">{{ datos.salasRegistradas }}</p>
        </div>

        <!-- Préstamos activos -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-sm font-medium text-gray-500 mb-1">Préstamos activos</h3>
          <p class="text-3xl font-bold text-gray-800">{{ datos.prestamosActivos }}</p>
        </div>

      </div>

      <!-- ============================= -->
      <!-- SECCIÓN DE ALERTAS (NUEVA)   -->
      <!-- ============================= -->
      <div class="mt-10">
        <h2 class="text-xl font-semibold mb-4">Alertas</h2>

        <div class="bg-white p-6 rounded-lg shadow border">
          <ul class="space-y-3">
            <li>🛠️ <strong>{{ alertas.equiposMantenimiento }}</strong> equipos en mantenimiento</li>
            <li>📦 <strong>{{ alertas.salasSinEquipos }}</strong> salas sin equipos</li>
          </ul>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      datos: {
        equiposRegistrados: 0,
        salasRegistradas: 0,
        prestamosActivos: 0,
      },
      alertas: {
        equiposMantenimiento: 0,
        salasSinEquipos: 0,
      },
      loading: true,
    };
  },

async mounted() {
  try {
    // Dashboard principal
    const res = await axios.get(import.meta.env.VITE_API_URL + "/dashboard");
    this.datos = {
      equiposRegistrados: res.data.totalEquipos,
      salasRegistradas: res.data.totalSalas,
      prestamosActivos: res.data.prestamosActivos
    };

    // ALERTAS
    const alertaRes = await axios.get(import.meta.env.VITE_API_URL + "/dashboard/alertas");
    this.alertas = alertaRes.data;

  } catch (error) {
    console.error("Error al cargar dashboard:", error);
  } finally {
    this.loading = false;
  }
}

};
</script>

<style scoped>
</style>
