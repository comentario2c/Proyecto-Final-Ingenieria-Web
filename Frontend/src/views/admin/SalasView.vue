<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">Salas</h1>

    <!-- Modal para mover equipos -->
    <div v-if="showModalMoverEquipos" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl w-96">
        <h3 class="text-lg font-semibold mb-4">Mover Equipos de Sala</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Sala Origen:</label>
          <input 
            v-model="movimiento.salaOrigen" 
            readonly 
            class="w-full px-3 py-2 border rounded bg-gray-100"
          />
          <p class="text-xs text-gray-500 mt-1">
            Equipos disponibles: {{ equiposEnSala }}
          </p>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Cantidad a Mover:</label>
          <input
            type="number"
            v-model="movimiento.cantidad"
            :max="equiposEnSala"
            min="1"
            class="w-full px-3 py-2 border rounded"
            placeholder="Ej: 3"
          />
          <p class="text-xs text-gray-500 mt-1">
            Máximo disponible: {{ equiposEnSala }} equipos
          </p>
          
          <!-- Opción para mover todos -->
          <div class="mt-2">
            <label class="flex items-center text-sm">
              <input 
                type="checkbox" 
                v-model="moverTodos"
                @change="toggleMoverTodos"
                class="mr-2"
              >
              Mover todos los equipos ({{ equiposEnSala }})
            </label>
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Sala Destino:</label>
          <select 
            v-model="movimiento.salaDestino" 
            class="w-full px-3 py-2 border rounded"
            :disabled="salasDisponibles.length === 0"
          >
            <option value="">Seleccione una sala</option>
            <option 
              v-for="sala in salasDisponibles" 
              :key="sala.nombreSala" 
              :value="sala.nombreSala"
            >
              {{ sala.nombreSala }} ({{ sala.stockReal }}/{{ sala.stockSugerido }} equipos)
            </option>
          </select>
        </div>
        
        <div class="flex gap-2 justify-end">
          <button 
            @click="confirmarMoverEquipos" 
            :disabled="!movimientoValidado"
            class="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {{ moverTodos ? 'Mover Todos' : 'Mover Equipos' }}
          </button>
          <button 
            @click="cancelarMoverEquipos" 
            class="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de Salas -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div v-if="salas.length === 0" class="text-center py-8 text-gray-500">
        No hay salas registradas
      </div>
      
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b">
            <th class="py-2 px-3">Nombre</th>
            <th class="py-2 px-3">Stock Real</th>
            <th class="py-2 px-3">Capacidad Sugerida</th>
            <th class="py-2 px-3">Estado</th>
            <th class="py-2 px-3">Descripción</th>
            <th class="py-2 px-3">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="sala in salas" :key="sala.nombreSala" class="border-b">
            <td class="py-2 px-3 font-medium">{{ sala.nombreSala }}</td>
            
            <!-- Stock Real -->
            <td class="py-2 px-3">
              <span :class="{
                'text-green-600 font-semibold': sala.stockReal > 0,
                'text-gray-500': sala.stockReal === 0
              }">
                {{ sala.stockReal }} equipos
              </span>
            </td>
            
            <!-- Capacidad Sugerida -->
            <td class="py-2 px-3">
              <span :class="{
                'text-blue-600': sala.stockReal <= sala.stockSugerido,
                'text-orange-600': sala.stockReal > sala.stockSugerido
              }">
                {{ sala.stockSugerido }} equipos
              </span>
              <div v-if="sala.stockReal > sala.stockSugerido" class="text-xs text-orange-500">
                ⚠️ Sobrecargada
              </div>
              <div v-else-if="sala.stockReal === sala.stockSugerido" class="text-xs text-green-500">
                ✅ Completa
              </div>
              <div v-else-if="sala.stockReal > 0" class="text-xs text-blue-500">
                🔵 Con espacio
              </div>
              <div v-else class="text-xs text-gray-500">
                ◯ Vacía
              </div>
            </td>
            
            <!-- Estado -->
            <td class="py-2 px-3">
              <span :class="sala.activo ? 'text-green-600' : 'text-red-600'">
                {{ sala.activo ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
            
            <td class="py-2 px-3">{{ sala.descripcion }}</td>

            <td class="py-2 px-3 flex gap-2">
              <button
                class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                @click="editarSala(sala)"
              >
                Editar
              </button>

              <button
                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                @click="verificarEliminarSala(sala)"
              >
                Eliminar
              </button>

              <!-- Botón para mover equipos (solo visible si la sala tiene equipos y está activa) -->
              <button
                v-if="sala.stockReal > 0 && sala.activo"
                class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                @click="prepararMoverEquipos(sala)"
              >
                Mover Equipos
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Formulario -->
    <div class="bg-white p-6 mt-6 rounded-lg shadow-sm border border-gray-200">
      <h2 class="text-xl font-semibold mb-4">
        {{ editando ? "Editar Sala" : "Crear Sala" }}
      </h2>

      <form @submit.prevent="guardarSala">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div>
            <label class="block text-sm font-medium mb-1">Nombre Sala</label>
            <input
              type="text"
              v-model="form.nombreSala"
              :disabled="editando"
              class="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Capacidad Sugerida</label>
            <input
              type="number"
              v-model="form.stockSugerido"
              min="0"
              class="w-full px-3 py-2 border rounded"
              placeholder="Número de equipos recomendado"
            />
          </div>

          <div v-if="editando" class="col-span-2">
            <label class="block text-sm font-medium mb-1">Estado</label>
            <select v-model="form.activo" class="w-full px-3 py-2 border rounded">
              <option :value="1">Activa</option>
              <option :value="0">Inactiva</option>
            </select>
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              v-model="form.descripcion"
              class="w-full px-3 py-2 border rounded"
              placeholder="Descripción de la sala..."
            ></textarea>
          </div>

        </div>

        <button
          type="submit"
          class="bg-green-600 text-white mt-4 px-4 py-2 rounded hover:bg-green-700"
        >
          {{ editando ? "Actualizar" : "Crear" }}
        </button>
        
        <button
          v-if="editando"
          type="button"
          @click="cancelarEdicion"
          class="bg-gray-500 text-white mt-4 px-4 py-2 rounded hover:bg-gray-600 ml-2"
        >
          Cancelar
        </button>
      </form>
    </div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      salas: [],
      salasDisponibles: [],
      editando: false,
      showModalMoverEquipos: false,
      equiposEnSala: 0,
      moverTodos: false,
      movimiento: {
        salaOrigen: '',
        salaDestino: '',
        cantidad: 1
      },
      form: {
        nombreSala: "",
        stockSugerido: 0,
        descripcion: "",
        activo: 1
      },
    };
  },

  async mounted() {
    this.cargarSalas();
  },

  computed: {
    movimientoValidado() {
      return this.movimiento.salaDestino && 
             ((this.moverTodos && this.equiposEnSala > 0) || 
              (!this.moverTodos && this.movimiento.cantidad > 0 && this.movimiento.cantidad <= this.equiposEnSala));
    }
  },

  methods: {
    async cargarSalas() {
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + "/salas");
        this.salas = res.data;
        console.log("Salas cargadas:", this.salas);
      } catch (error) {
        console.error("Error cargando salas:", error);
        alert("Error al cargar las salas");
      }
    },

    editarSala(sala) {
      this.editando = true;
      this.form = { 
        nombreSala: sala.nombreSala,
        stockSugerido: sala.stockSugerido,
        descripcion: sala.descripcion,
        activo: sala.activo
      };
    },

    cancelarEdicion() {
      this.editando = false;
      this.form = { nombreSala: "", stockSugerido: 0, descripcion: "", activo: 1 };
    },

    // Verificar si se puede eliminar una sala
    async verificarEliminarSala(sala) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/salas/${sala.nombreSala}/estado-eliminacion`);
        const estado = response.data.data;
        
        if (estado.puedeEliminar) {
          // Sala vacía - eliminar directamente
          if (confirm(`¿Está seguro de eliminar la sala "${sala.nombreSala}"?`)) {
            await this.eliminarSala(sala.nombreSala);
          }
        } else {
          // Sala con equipos - ofrecer opciones
          if (estado.stockEquipos > 0) {
            const opcion = confirm(
              `La sala "${sala.nombreSala}" tiene ${estado.stockEquipos} equipos.\n\n` +
              `¿Desea MOVER los equipos a otra sala?\n\n` +
              `- Click en "Aceptar" para MOVER equipos\n` +
              `- Click en "Cancelar" para ELIMINAR sala con todos sus equipos`
            );
            
            if (opcion) {
              // Mover equipos
              this.prepararMoverEquipos(sala);
            } else {
              // Eliminar forzadamente con equipos
              if (confirm(`⚠️ ADVERTENCIA: Se eliminarán ${estado.stockEquipos} equipos permanentemente.\n\n¿Está completamente seguro?`)) {
                await this.eliminarSalaForzada(sala.nombreSala);
              }
            }
          } else {
            alert(estado.mensaje);
          }
        }
      } catch (error) {
        console.error('Error verificando sala:', error);
        alert(error.response?.data?.message || 'Error al verificar el estado de la sala');
      }
    },

    // Eliminar sala normal (vacía)
    async eliminarSala(nombre) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/salas/${nombre}`);
        alert('Sala eliminada correctamente');
        this.cargarSalas();
      } catch (error) {
        console.error('Error eliminando sala:', error);
        alert(error.response?.data?.message || 'Error al eliminar la sala');
      }
    },

    // Eliminar sala forzadamente (con equipos)
    async eliminarSalaForzada(nombre) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/salas/${nombre}`);
        alert(`Sala "${nombre}" eliminada junto con todos sus equipos`);
        this.cargarSalas();
      } catch (error) {
        console.error('Error eliminando sala forzada:', error);
        alert(error.response?.data?.message || 'Error al eliminar la sala');
      }
    },

    // Preparar modal para mover equipos
    async prepararMoverEquipos(sala) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/salas-disponibles?excluir=${sala.nombreSala}`);
        this.salasDisponibles = response.data.data;
        
        // Obtener cantidad de equipos en la sala
        const equiposResponse = await axios.get(`${import.meta.env.VITE_API_URL}/equipos-por-sala/${sala.nombreSala}`);
        this.equiposEnSala = equiposResponse.data.total;
        
        this.movimiento.salaOrigen = sala.nombreSala;
        this.movimiento.salaDestino = '';
        this.movimiento.cantidad = 1;
        this.moverTodos = false;
        this.showModalMoverEquipos = true;
      } catch (error) {
        console.error('Error preparando movimiento:', error);
        alert('Error al preparar el movimiento de equipos');
      }
    },

    toggleMoverTodos() {
      if (this.moverTodos) {
        this.movimiento.cantidad = this.equiposEnSala;
      } else {
        this.movimiento.cantidad = 1;
      }
    },

    // Confirmar mover equipos
    async confirmarMoverEquipos() {
      try {
        let endpoint = import.meta.env.VITE_API_URL + '/salas/mover-equipos-cantidad';
        let body = { ...this.movimiento };
        
        // Si es mover todos, usar el endpoint original
        if (this.moverTodos) {
          endpoint = import.meta.env.VITE_API_URL + '/salas/mover-equipos-mejorado';
          body = {
            salaOrigen: this.movimiento.salaOrigen,
            salaDestino: this.movimiento.salaDestino
          };
        }
        
        const response = await axios.put(endpoint, body);
        alert(response.data.message);
        this.showModalMoverEquipos = false;
        this.cargarSalas();
        
      } catch (error) {
        console.error('Error moviendo equipos:', error);
        alert(error.response?.data?.message || 'Error al mover los equipos');
      }
    },

    cancelarMoverEquipos() {
      this.showModalMoverEquipos = false;
      this.movimiento = { salaOrigen: '', salaDestino: '', cantidad: 1 };
      this.moverTodos = false;
    },

    async guardarSala() {
      try {
        if (this.editando) {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/salas/${this.form.nombreSala}`,
            this.form
          );
          alert("Sala actualizada correctamente");
        } else {
          await axios.post(`${import.meta.env.VITE_API_URL}/salas`, this.form);
          alert("Sala creada correctamente");
        }

        this.editando = false;
        this.form = { nombreSala: "", stockSugerido: 0, descripcion: "", activo: 1 };
        this.cargarSalas();
      } catch (error) {
        console.error("Error guardando sala:", error);
        alert(error.response?.data?.message || "Error al guardar la sala");
      }
    },
  },
};
</script>