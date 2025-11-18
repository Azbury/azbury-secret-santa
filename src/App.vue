<template>
  <div id="app">
    <!-- Navigation Header -->
    <nav v-if="authStore.isAuthenticated" class="navbar">
      <div class="nav-container">
        <router-link to="/dashboard" class="nav-brand">
          🎅 Secret Santa
        </router-link>
        
        <div class="nav-links">
          <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
          <router-link to="/christmas-list" class="nav-link">My List</router-link>
          <router-link to="/secret-santa" class="nav-link">Secret Santa</router-link>
          <router-link to="/profile" class="nav-link">Profile</router-link>
          <button @click="handleLogout" class="nav-button">Logout</button>
        </div>
        
        <!-- Mobile menu button -->
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="mobile-menu-btn">
          ☰
        </button>
      </div>
      
      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="mobile-menu">
        <router-link to="/dashboard" class="mobile-nav-link" @click="mobileMenuOpen = false">
          Dashboard
        </router-link>
        <router-link to="/christmas-list" class="mobile-nav-link" @click="mobileMenuOpen = false">
          My List
        </router-link>
        <router-link to="/secret-santa" class="mobile-nav-link" @click="mobileMenuOpen = false">
          Secret Santa
        </router-link>
        <router-link to="/profile" class="mobile-nav-link" @click="mobileMenuOpen = false">
          Profile
        </router-link>
        <button @click="handleLogout" class="mobile-nav-button">Logout</button>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="main-content">
      <router-view />
    </main>
    
    <!-- Footer -->
    <footer v-if="authStore.isAuthenticated" class="footer">
      <div class="footer-content">
        <p>&copy; {{ currentYear }} Secret Santa App. Spread the Christmas joy! 🎄</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const mobileMenuOpen = ref(false)
const currentYear = computed(() => new Date().getFullYear())

const handleLogout = async () => {
  // Logout and clear auth state
  await authStore.logout()
  
  // Close mobile menu
  mobileMenuOpen.value = false
  
  // Navigate to login page
  await router.push('/login')
}
</script>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #2d3748;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navigation */
.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-brand:hover {
  color: #5a67d8;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  color: #4a5568;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: #edf2f7;
  color: #667eea;
}

.nav-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-button:hover {
  background: #5a67d8;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #4a5568;
}

.mobile-menu {
  display: none;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  background: white;
}

.mobile-nav-link {
  display: block;
  color: #4a5568;
  text-decoration: none;
  font-weight: 500;
  padding: 12px 0;
  border-bottom: 1px solid #edf2f7;
}

.mobile-nav-link:hover {
  color: #667eea;
}

.mobile-nav-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
}

/* Main Content */
.main-content {
  flex: 1;
}

/* Footer */
.footer {
  background: #2d3748;
  color: white;
  text-align: center;
  padding: 20px;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-menu {
    display: block;
  }
}

/* Utility Classes */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #e2e8f0;
  color: #2d3748;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2d3748;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}
</style>
