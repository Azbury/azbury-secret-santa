import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { useChristmasListStore } from './stores/christmasList'
import { useSecretSantaStore } from './stores/secretSanta'

// Import global styles
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize stores after pinia is installed
const authStore = useAuthStore()
const christmasListStore = useChristmasListStore()
const secretSantaStore = useSecretSantaStore()

// Initialize auth first, then load data and mount app
const initializeApp = async () => {
  // Wait for auth initialization to complete
  await authStore.initializeAuth()
  
  // Load other data if user is authenticated
  if (authStore.isAuthenticated) {
    christmasListStore.loadItems()
    secretSantaStore.loadSecretSantaData()
  }
  
  // Mount the app after auth is ready
  app.mount('#app')
}

initializeApp()
