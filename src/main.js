import { createApp } from 'vue'
import { pinia } from './stores'
import './style.css'
import App from './App.vue'
import routes from './router'
import ElementPlus from 'element-plus'
import '../firebase'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app
  .use(routes)
  .use(ElementPlus)
  .use(pinia)
.mount('#app')
