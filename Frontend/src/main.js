import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import { initializeApp } from 'firebase/app'
import { createPinia } from 'pinia'

const pinia = createPinia()
const app = createApp(App)

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTHDOMINE,
  projectId: import.meta.env.VITE_PROJECTID,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_APPID,
  authDomain: 'falser-gabrielle-nonequitably.ngrok-free.dev'
};

app.use(pinia)
initializeApp(firebaseConfig)
createApp(App).use(router).mount('#app')
