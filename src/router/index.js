import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ProviderServices from '../views/ProviderServices.vue'
import ServiceDetail from '../views/ServiceDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/:provider', component: ProviderServices, props: true },
    { path: '/:provider/:id', component: ServiceDetail, props: true },
  ],
})

export default router
