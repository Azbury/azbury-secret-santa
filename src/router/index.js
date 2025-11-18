import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'

// Import views
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import RegistrationSuccessView from '../views/RegistrationSuccessView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProfileView from '../views/ProfileView.vue'  
import ChristmasListView from '../views/ChristmasListView.vue'
import SecretSantaView from '../views/SecretSantaView.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { requiresGuest: true }
  },
  {
    path: '/registration-success',
    name: 'RegistrationSuccess',
    component: RegistrationSuccessView,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/christmas-list',
    name: 'ChristmasList',
    component: ChristmasListView,
    meta: { requiresAuth: true }
  },
  {
    path: '/secret-santa',
    name: 'SecretSanta',
    component: SecretSantaView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth initialization if not already done
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router