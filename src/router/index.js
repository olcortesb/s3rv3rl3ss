import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ProviderServices from '../views/ProviderServices.vue'
import ServiceDetail from '../views/ServiceDetail.vue'
import Compare from '../views/Compare.vue'
import Metrics from '../views/Metrics.vue'
import Tools from '../views/Tools.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/compare', component: Compare },
    { path: '/compare/:category', component: Compare, props: true },
    { path: '/metrics', component: Metrics },
    { path: '/tools', component: Tools },
    { path: '/:provider', component: ProviderServices, props: true },
    { path: '/:provider/:id', component: ServiceDetail, props: true },
  ],
})

export default router
