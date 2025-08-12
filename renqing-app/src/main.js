import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { initDB } from './services/storage'

const app = createApp(App)

// 初始化IndexedDB
initDB().then(() => {
  console.log("Database initialized")
}).catch(err => {
  console.error("Database initialization failed:", err)
})

app.use(createPinia())
app.use(router)

app.mount('#app')