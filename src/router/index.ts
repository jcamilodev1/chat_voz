import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import LoginView from '@/pages/LoginView.vue'
import ChatView from '@/pages/ChatView.vue'
import { useUserStore } from '@/stores/user'

// Definir rutas
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/chat',
    name: 'chat',
    component: ChatView,
    meta: { requiresAuth: true }
  },
  {
    // Redirigir rutas no encontradas al login
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

// Crear router
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guards de navegación
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // Cargar usuario desde localStorage si no está cargado
  if (!userStore.isLoggedIn) {
    userStore.loadUserFromStorage()
  }
  
  // Verificar autenticación
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/')
  } else if (to.meta.requiresGuest && userStore.isLoggedIn) {
    next('/chat')
  } else {
    next()
  }
})

export default router
