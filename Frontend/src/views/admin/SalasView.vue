<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">Salas</h1>

    <!-- Tabla de Salas -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b">
            <th class="py-2 px-3">Nombre</th>
            <th class="py-2 px-3">Stock Equipos</th>
            <th class="py-2 px-3">Descripción</th>
            <th class="py-2 px-3">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="sala in salas" :key="sala.nombreSala" class="border-b">
            <td class="py-2 px-3">{{ sala.nombreSala }}</td>
            <td class="py-2 px-3">{{ sala.stockEquipos }}</td>
            <td class="py-2 px-3">{{ sala.descripcion }}</td>

            <td class="py-2 px-3 flex gap-3">
              <button
                class="bg-blue-500 text-white px-3 py-1 rounded"
                @click="editarSala(sala)"
              >
                Editar
              </button>

              <button
                class="bg-red-500 text-white px-3 py-1 rounded"
                @click="eliminarSala(sala.nombreSala)"
              >
                Eliminar
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
            <label class="block text-sm font-medium mb-1">Stock Equipos</label>
            <input
              type="number"
              v-model="form.stockEquipos"
              min="0"
              class="w-full px-3 py-2 border rounded"
            />
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              v-model="form.descripcion"
              class="w-full px-3 py-2 border rounded"
            ></textarea>
          </div>

        </div>

        <button
          type="submit"
          class="bg-green-600 text-white mt-4 px-4 py-2 rounded"
        >
          {{ editando ? "Actualizar" : "Crear" }}
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
      editando: false,
      form: {
        nombreSala: "",
        stockEquipos: 0,
        descripcion: "",
      },
    };
  },

  async mounted() {
    this.cargarSalas();
  },

  methods: {
    async cargarSalas() {
      const res = await axios.get("http://localhost:3000/api/salas");
      this.salas = res.data;
    },

    editarSala(sala) {
      this.editando = true;
      this.form = { ...sala };
    },

    async eliminarSala(nombre) {
      if (!confirm("¿Seguro que deseas eliminar esta sala?")) return;

      await axios.delete(`http://localhost:3000/api/salas/${nombre}`);
      this.cargarSalas();
    },

    async guardarSala() {
      if (this.editando) {
        await axios.put(
          `http://localhost:3000/api/salas/${this.form.nombreSala}`,
          this.form
        );
      } else {
        await axios.post("http://localhost:3000/api/salas", this.form);
      }

      this.editando = false;
      this.form = { nombreSala: "", stockEquipos: 0, descripcion: "" };
      this.cargarSalas();
    },
  },
};
</script>
