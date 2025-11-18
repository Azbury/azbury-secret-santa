import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI, usersAPI } from '../services/api.js'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value)

  // Actions
  const login = async (email, password) => {
    isLoading.value = true
    try {
      const response = await authAPI.login(email, password)
      user.value = response.user
      
      // Load user-specific data after successful login
      const { useChristmasListStore } = await import('./christmasList.js')
      const { useSecretSantaStore } = await import('./secretSanta.js')
      const christmasListStore = useChristmasListStore()
      const secretSantaStore = useSecretSantaStore()
      
      // Load fresh data for the newly logged in user
      christmasListStore.loadItems()
      secretSantaStore.loadSecretSantaData()
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData) => {
    isLoading.value = true
    try {
      // For now, we'll still handle profile picture as base64 since we haven't implemented file upload yet
      const registrationData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        // TODO: Implement proper file upload for profile pictures
      }
      
      const response = await authAPI.register(registrationData)
      user.value = response.user
      
      // Handle profile picture if provided (temporary solution)
      if (userData.profilePicture) {
        const profilePictureUrl = URL.createObjectURL(userData.profilePicture)
        user.value.profile_picture_url = profilePictureUrl
        // TODO: Upload to server
      }
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Clear user state immediately
      user.value = null
      // Also clear token from localStorage (backup in case API call failed)
      localStorage.removeItem('authToken')
      // Reset initialization state to allow re-initialization
      isInitialized.value = false
      
      // Clear all user-specific data from other stores
      const { useChristmasListStore } = await import('./christmasList.js')
      const { useSecretSantaStore } = await import('./secretSanta.js')
      const christmasListStore = useChristmasListStore()
      const secretSantaStore = useSecretSantaStore()
      
      christmasListStore.clearItems()
      secretSantaStore.clearAllData()
    }
  }

  const updateProfile = async (profileData) => {
    isLoading.value = true
    try {
      const response = await usersAPI.updateProfile(profileData)
      user.value = response.user
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateProfilePicture = (pictureUrl) => {
    if (user.value) {
      user.value.profile_picture_url = pictureUrl
      // TODO: Upload to server
    }
  }

  const initializeAuth = async () => {
    // Prevent multiple initializations
    if (isInitialized.value) {
      return
    }
    
    // Check if we have a token
    const token = localStorage.getItem('authToken')
    
    try {
      if (token) {
        try {
          const response = await authAPI.getCurrentUser()
          user.value = response.user
        } catch (error) {
          console.error('Failed to get current user:', error)
          // Clear invalid token and user state
          localStorage.removeItem('authToken')
          user.value = null
        }
      } else {
        // Ensure user state is cleared if no token
        user.value = null
      }
    } finally {
      // Mark as initialized regardless of success/failure
      isInitialized.value = true
    }
  }

  return {
    // State
    user,
    isLoading,
    isInitialized,
    
    // Getters
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    updateProfilePicture,
    initializeAuth
  }
})