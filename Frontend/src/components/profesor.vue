<script setup>
import { ref } from 'vue';
import { StreamBarcodeReader } from '@teckel/vue-barcode-reader'

const decodedText = ref('')

const onDecode = (result) => {
  decodedText.value = result
}

const onLoaded = () => {
  console.log('loaded')
}

</script>

<template>
    <StreamBarcodeReader
    torch
    no-front-cameras
    @decode="onDecode"
    @loaded="onLoaded"
    
    />

    <h2>Decoded value: {{ decodedText }}</h2>
</template>