// @ts-ignore 无法找到模块“vue”的声明文件
import { createApp } from 'vue'
// @ts-ignore 无法找到模块“pinia”或其相应的类型声明
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import './main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
