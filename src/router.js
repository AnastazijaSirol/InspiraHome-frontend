import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './components/Home.vue'
import AboutPage from './components/About.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router