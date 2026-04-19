import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ServiceDetail from '../views/ServiceDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/service/:id', component: ServiceDetail, props: true },
  ],
})

export default router
