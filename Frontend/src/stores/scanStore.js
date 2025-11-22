import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useScanStore = defineStore('scan', () => {
  // Guardar temporalmente los datos
  const rutUsuario = ref('');
  const idEquipo = ref('');

  // controlar el scanner
  const mostrarScanner = ref(false);
  const campoObjetivo = ref(null); 

  // Funciones auxiliares para el scanner
  function abrirScanner(objetivo) {
    campoObjetivo.value = objetivo; 
    mostrarScanner.value = true;
  }

  // Distingo si el usuario presionó el boton de escanear el rut o el codigo del equipo
  function procesarEscaneo(codigo) {
    if (campoObjetivo.value === 'rut') {
      rutUsuario.value = codigo;
    } else if (campoObjetivo.value === 'equipo') {
      idEquipo.value = codigo;
    }
    
    cerrarScanner();
  }

  // Pensada para cerrar el escaner cuando el usuario presiona el boton de cerrar o cuando detecta un codigo
  function cerrarScanner() {
    mostrarScanner.value = false;
    campoObjetivo.value = null;
  }

  // Resetear los campos para un nuevo registro
  function resetForm() {
    rutUsuario.value = '';
    idEquipo.value = '';
  }

  return { 
    rutUsuario, 
    idEquipo, 
    mostrarScanner, 
    campoObjetivo,
    abrirScanner, 
    procesarEscaneo, 
    cerrarScanner, 
    resetForm 
  };
});