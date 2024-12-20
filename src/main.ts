import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import colors from 'vuetify/util/colors'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    themes: {
      light: {
        dark: false,
        colors: {
          primary: colors.purple.lighten3,
          secondary: colors.blue.lighten2,
          error: colors.red.lighten1,
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: colors.purple.lighten3,
          secondary: colors.blue.lighten2,
          error: colors.red.lighten1,
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})

import App from './App.vue'
import router from './router'
import { initMapLoader } from './services/maps.service'
initMapLoader()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
