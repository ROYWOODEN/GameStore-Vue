import '@/app/styles/index.css'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'
import { createPinia } from 'pinia'
import 'primeicons/primeicons.css'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'

import App from './App.vue'
import { i18n } from './app/i18n'
import router from './app/router'
import { GameStorePreset } from './app/theme/game-store'

const app = createApp(App)

app.component('VueIcon', VueIcon)
app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: GameStorePreset,
    options: {
      darkModeSelector: '.app-dark',
    },
  },
})
app.use(i18n)

app.mount('#app')
