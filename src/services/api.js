// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

// Helper function to make authenticated requests
const apiRequest = async (url, options = {}) => {
  const token = getAuthToken()
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE_URL}${url}`, config)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Auth API
export const authAPI = {
  async register(userData) {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token)
    }
    
    return response
  },

  async login(email, password) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token)
    }
    
    return response
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } finally {
      localStorage.removeItem('authToken')
    }
  },

  async getCurrentUser() {
    return apiRequest('/auth/me')
  },
}

// Users API
export const usersAPI = {
  async getProfile() {
    return apiRequest('/users/profile')
  },

  async updateProfile(profileData) {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  },

  async getUserChristmasList(userId) {
    return apiRequest(`/users/${userId}/christmas-list`)
  },
}

// Christmas Lists API
export const christmasListAPI = {
  async getItems() {
    return apiRequest('/christmas-lists')
  },

  async addItem(itemData) {
    return apiRequest('/christmas-lists', {
      method: 'POST',
      body: JSON.stringify(itemData),
    })
  },

  async updateItem(itemId, itemData) {
    return apiRequest(`/christmas-lists/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    })
  },

  async deleteItem(itemId) {
    return apiRequest(`/christmas-lists/${itemId}`, {
      method: 'DELETE',
    })
  },
}

// Secret Santa API
export const secretSantaAPI = {
  async getEvents() {
    return apiRequest('/secret-santa/events')
  },

  async createEvent(eventData) {
    return apiRequest('/secret-santa/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    })
  },

  async getEvent(eventId) {
    return apiRequest(`/secret-santa/events/${eventId}`)
  },

  async sendInvitation(eventId, email) {
    return apiRequest(`/secret-santa/events/${eventId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  async generateAssignments(eventId) {
    return apiRequest(`/secret-santa/events/${eventId}/generate-assignments`, {
      method: 'POST',
    })
  },

  async getMyAssignment(eventId) {
    return apiRequest(`/secret-santa/my-assignment/${eventId}`)
  },
}

// Health check
export const healthAPI = {
  async check() {
    return apiRequest('/health')
  },
}