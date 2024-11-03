import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './components/Home.vue'
import AboutPage from './components/About.vue'
import ProfilePage from './components/Profile.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
  { path: '/profile', component: ProfilePage}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
