<template>
  <div class="profile">
    <div class="container">
      <header class="profile-header">
        <h1>👤 My Profile</h1>
        <p>Manage your account information</p>
      </header>
      
      <div class="profile-grid">
        <div class="profile-card">
          <div class="profile-picture-section">
            <div class="current-picture">
              <img 
                v-if="authStore.user?.profilePictureUrl" 
                :src="authStore.user.profilePictureUrl" 
                alt="Profile picture"
                class="profile-image"
              />
              <div v-else class="default-avatar">
                {{ getInitials(authStore.user?.name) }}
              </div>
            </div>
            
            <div class="picture-controls">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileUpload"
                style="display: none"
              />
              <button @click="$refs.fileInput.click()" class="btn btn-secondary">
                Change Picture
              </button>
              <button 
                v-if="authStore.user?.profilePictureUrl" 
                @click="removePicture"
                class="btn btn-outline"
              >
                Remove
              </button>
            </div>
          </div>
          
          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input
                id="name"
                v-model="profileData.name"
                type="text"
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                v-model="profileData.email"
                type="email"
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="bio">About Me (Optional)</label>
              <textarea
                id="bio"
                v-model="profileData.bio"
                placeholder="Tell others a bit about yourself..."
                class="form-textarea"
                rows="4"
              ></textarea>
            </div>
            
            <div class="form-buttons">
              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                {{ isLoading ? 'Saving...' : 'Save Changes' }}
              </button>
              <router-link to="/dashboard" class="btn btn-secondary">
                Cancel
              </router-link>
            </div>
          </form>
        </div>
        
        <div class="stats-card">
          <h3>Account Stats</h3>
          <div class="stat-item">
            <span class="stat-label">Christmas List Items:</span>
            <span class="stat-value">{{ christmasListStore.items.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Member Since:</span>
            <span class="stat-value">{{ formatDate(authStore.user?.createdAt) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Secret Santa Status:</span>
            <span class="stat-value">
              {{ secretSantaStore.assignment ? 'Assigned' : 'Waiting' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useChristmasListStore } from '../stores/christmasList'
import { useSecretSantaStore } from '../stores/secretSanta'

const authStore = useAuthStore()
const christmasListStore = useChristmasListStore()
const secretSantaStore = useSecretSantaStore()

const isLoading = ref(false)
const fileInput = ref(null)

const profileData = reactive({
  name: '',
  email: '',
  bio: ''
})

onMounted(() => {
  // Initialize form with current user data
  if (authStore.user) {
    profileData.name = authStore.user.name || ''
    profileData.email = authStore.user.email || ''
    profileData.bio = authStore.user.bio || ''
  }
})

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // In a real app, you'd upload this to your server
    const reader = new FileReader()
    reader.onload = (e) => {
      authStore.updateProfilePicture(e.target.result)
    }
    reader.readAsDataURL(file)
  }
}

const removePicture = () => {
  authStore.updateProfilePicture(null)
}

const updateProfile = async () => {
  isLoading.value = true
  try {
    await authStore.updateProfile({
      name: profileData.name,
      email: profileData.email,
      bio: profileData.bio
    })
    // Show success message
    alert('Profile updated successfully!')
  } catch (error) {
    console.error('Failed to update profile:', error)
    alert('Failed to update profile. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.profile {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.profile-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.profile-header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.profile-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

.profile-card, .stats-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.profile-picture-section {
  text-align: center;
  margin-bottom: 30px;
}

.current-picture {
  margin-bottom: 15px;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e2e8f0;
}

.default-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto;
}

.picture-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2d3748;
  font-weight: 500;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.stats-card h3 {
  color: #2d3748;
  margin-bottom: 20px;
  text-align: center;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #718096;
  font-weight: 500;
}

.stat-value {
  color: #2d3748;
  font-weight: 600;
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
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
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

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>