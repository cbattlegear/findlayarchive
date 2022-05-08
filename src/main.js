import "bootstrap/dist/css/bootstrap.min.css"

import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // <---
import VueProgressiveImage from 'vue-progressive-image'

createApp(App).use(VueProgressiveImage).use(router).mount('#app')

import "bootstrap/dist/js/bootstrap.js"