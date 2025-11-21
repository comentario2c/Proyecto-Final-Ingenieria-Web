<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import { CoreModule, LicenseManager, CameraEnhancer, CameraView, CaptureVisionRouter, MultiFrameResultCrossFilter } from "dynamsoft-barcode-reader-bundle";

// ruta localhost:5173/dbr/dynamsoft-barcode-reader-bundle@11.2.4000 
// la ruta no deberia ser esa pero desconozco la razon del porque fuerza esa ruta
const resourcesPath = window.location.origin + "/dbr/";

// Archivos necesarios para el lector 
CoreModule.engineResourcePaths = {
  rootDirectory: resourcesPath,
  std: "dynamsoft-barcode-reader-bundle.wasm", 
  worker: "dbr.bundle.worker.js",
  js: "dbr.bundle.js"
};

// Licencia desde variables de entorno (dynamsoft)
LicenseManager.initLicense(import.meta.env.VITE_DYNAMSOFT_LICENCE_KEY, {
  executeNow: true,
});

const cameraViewContainer = ref(null);
const resultText = ref(""); // respuesta de la lectura
let cvRouter = null;
let cameraEnhancer = null;
let isDestroyed = false; // cerrar camara

// sacado de un ejemplo de la docuemntacion
onMounted(async () => {
  try{
    // Create a `CameraEnhancer` instance for camera control and a `CameraView` instance for UI control.
    const cameraView = await CameraView.createInstance();
    if (isDestroyed) { throw Error(componentDestroyedErrorMsg); } // Check if component is destroyed after every async

    cameraEnhancer = await CameraEnhancer.createInstance(cameraView);
    if (isDestroyed) { throw Error(componentDestroyedErrorMsg); }

    // Get default UI and append it to DOM.
    cameraViewContainer.value!.append(cameraView.getUIElement());

    // Create a `CaptureVisionRouter` instance and set `CameraEnhancer` instance as its image source.
    cvRouter = await CaptureVisionRouter.createInstance();
    if (isDestroyed) { throw Error(componentDestroyedErrorMsg); }
    cvRouter.setInput(cameraEnhancer);

    // Define a callback for results.
    cvRouter.addResultReceiver({
      onDecodedBarcodesReceived: (result) => {
        if (!result.barcodeResultItems.length) return;

        resultText.value = '';
        console.log(result);
        for (let item of result.barcodeResultItems) {
          resultText.value += `${item.formatString}: ${item.text}\n\n`;
        }
      }
    });

    // Filter out unchecked and duplicate results.
    const filter = new MultiFrameResultCrossFilter();
    // Filter out unchecked barcodes.
    filter.enableResultCrossVerification("barcode", true);
    // Filter out duplicate barcodes within 3 seconds.
    filter.enableResultDeduplication("barcode", true);
    await cvRouter.addResultFilter(filter);
    if (isDestroyed) { throw Error(componentDestroyedErrorMsg); }

    // Open camera and start scanning barcode.
    await cameraEnhancer.open();
    cameraView.setScanLaserVisible(true);
    if (isDestroyed) { throw Error(componentDestroyedErrorMsg); }
    await cvRouter.startCapturing("ReadBarcodes_SpeedFirst");
    if (isDestroyed) { throw Error(componentDestroyedErrorMsg); }

  } catch (ex) {

    if ((ex as Error)?.message === componentDestroyedErrorMsg) {
      console.log(componentDestroyedErrorMsg);
    } else {
      let errMsg = ex.message || ex;
      console.error(ex);
      alert(errMsg);
    }
  }

  // Resolve pInit promise once initialization is complete.
  resolveInit!();
});

onBeforeUnmount(async () => {
  isDestroyed = true;
  try {
    await pInit; // Wait for the pInit to complete before disposing resources.
    cvRouter?.dispose();
    cameraEnhancer?.dispose();
  } catch (_) { }
});
</script>

<template>
  <div>
    <div ref="cameraViewContainer" style="width: 100%; height: 70vh; background: #eee;"></div>
    <br />
    Results:
    <div class="results">{{ resultText }}</div>
  </div>
</template>

<style scoped>
.camera-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #f4f4f9;
}

.camera-view {
  width: 100%;
  height: 100%;
}

.results-container {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 700px;
  height: 15vh;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  color: #333;
}

.results-container h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.1em;
}

.results-container pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: monospace;
}
</style>