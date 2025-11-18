<template>
  <div class="dashboard">
    <div class="container">
      <header class="dashboard-header">
        <h1>🎅 Secret Santa Dashboard</h1>
        <p>Welcome back, {{ authStore.user?.name }}!</p>
      </header>
      
      <div class="dashboard-grid">
        <div class="card">
          <h2>🎁 Your Christmas List</h2>
          <p>Manage your wishlist items</p>
          <div class="stats">
            <span class="stat">{{ christmasListStore.items.length }} items</span>
          </div>
          <router-link to="/christmas-list" class="btn btn-primary">
            Manage List
          </router-link>
        </div>
        
        <div class="card">
          <h2>👤 Your Profile</h2>
          <p>Update your information and photo</p>
          <router-link to="/profile" class="btn btn-secondary">
            Edit Profile
          </router-link>
        </div>
        
        <div class="card">
          <h2>🎄 Secret Santa Status</h2>
          <p v-if="!secretSantaStore.assignment">
            Waiting for Secret Santa assignments...
          </p>
          <p v-else>
            You're Secret Santa for: <strong>{{ secretSantaStore.assignment.name }}</strong>
          </p>
          <button 
            v-if="secretSantaStore.assignment" 
            @click="viewAssignmentList"
            class="btn btn-accent"
          >
            View Their List
          </button>
        </div>
        
        <div class="card">
          <h2>🎄 Manage Secret Santa</h2>
          <p>Create events and invite participants</p>
          <router-link to="/secret-santa" class="btn btn-accent">
            Manage Event
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useChristmasListStore } from '../stores/christmasList'
import { useSecretSantaStore } from '../stores/secretSanta'

const authStore = useAuthStore()
const christmasListStore = useChristmasListStore()
const secretSantaStore = useSecretSantaStore()





const viewAssignmentList = () => {
  // In a real app, this would navigate to view the assigned person's list
  alert(`Viewing ${secretSantaStore.assignment.name}'s Christmas list...`)
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.dashboard-header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.card h2 {
  color: #2d3748;
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.card p {
  color: #718096;
  margin-bottom: 20px;
}

.stats {
  margin-bottom: 20px;
}

.stat {
  display: inline-block;
  background: #e2e8f0;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #2d3748;
  font-weight: 500;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin: 5px;
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

.btn-accent {
  background: #48bb78;
  color: white;
}

.btn-accent:hover {
  background: #38a169;
}

.invite-form {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.invite-input {
  flex: 1;
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
}

.invite-input:focus {
  outline: none;
  border-color: #667eea;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>