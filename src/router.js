import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './components/Home.vue'
import AboutPage from './components/About.vue'
import ProfilePage from './components/Profile.vue'
import GroupPage from './components/GroupChats.vue'
import DesignersPage from './components/Designers.vue'
import QuizPage from './components/Quiz.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
  { path: '/profile', component: ProfilePage},
  { path: '/group-chats', component: GroupPage},
  { path: '/designers', component: DesignersPage},
  { path: '/quiz', component: QuizPage}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
