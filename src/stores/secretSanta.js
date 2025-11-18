import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSecretSantaStore = defineStore('secretSanta', () => {
  // State
  const participants = ref([])
  const assignment = ref(null)
  const isLoading = ref(false)
  const event = ref(null)

  // Getters
  const hasAssignment = computed(() => !!assignment.value)
  const participantCount = computed(() => participants.value.length)

  // Actions
  const loadSecretSantaData = () => {
    // Load data from localStorage
    const storedAssignment = localStorage.getItem('secretSantaAssignment')
    const storedParticipants = localStorage.getItem('secretSantaParticipants')
    const storedEvent = localStorage.getItem('secretSantaEvent')
    
    if (storedAssignment) {
      try {
        assignment.value = JSON.parse(storedAssignment)
      } catch (error) {
        console.error('Failed to parse stored assignment:', error)
      }
    }
    
    if (storedParticipants) {
      try {
        participants.value = JSON.parse(storedParticipants)
      } catch (error) {
        console.error('Failed to parse stored participants:', error)
      }
    }
    
    if (storedEvent) {
      try {
        event.value = JSON.parse(storedEvent)
      } catch (error) {
        console.error('Failed to parse stored event:', error)
      }
    }
  }

  const createSecretSantaEvent = async (eventData) => {
    isLoading.value = true
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newEvent = {
        id: Date.now(),
        name: eventData.name,
        description: eventData.description,
        date: eventData.date,
        budget: eventData.budget,
        createdAt: new Date().toISOString(),
        participants: []
      }
      
      event.value = newEvent
      localStorage.setItem('secretSantaEvent', JSON.stringify(newEvent))
      
      return newEvent
    } catch (error) {
      throw new Error('Failed to create Secret Santa event')
    } finally {
      isLoading.value = false
    }
  }

  const addParticipant = async (participantData) => {
    isLoading.value = true
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const newParticipant = {
        id: Date.now(),
        name: participantData.name,
        email: participantData.email,
        hasJoined: false,
        christmasListItems: [],
        addedAt: new Date().toISOString()
      }
      
      participants.value.push(newParticipant)
      localStorage.setItem('secretSantaParticipants', JSON.stringify(participants.value))
      
      return newParticipant
    } catch (error) {
      throw new Error('Failed to add participant')
    } finally {
      isLoading.value = false
    }
  }

  const generateAssignments = async () => {
    isLoading.value = true
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (participants.value.length < 2) {
        throw new Error('Need at least 2 participants for Secret Santa')
      }
      
      // Simple random assignment algorithm (not production ready)
      const shuffled = [...participants.value].sort(() => Math.random() - 0.5)
      const assignments = []
      
      for (let i = 0; i < shuffled.length; i++) {
        const giver = shuffled[i]
        const receiver = shuffled[(i + 1) % shuffled.length] // Circular assignment
        
        assignments.push({
          giver: giver,
          receiver: receiver
        })
      }
      
      // For demo purposes, just set the first assignment as the current user's
      if (assignments.length > 0) {
        assignment.value = {
          id: assignments[0].receiver.id,
          name: assignments[0].receiver.name,
          email: assignments[0].receiver.email
        }
        localStorage.setItem('secretSantaAssignment', JSON.stringify(assignment.value))
      }
      
      return assignments
    } catch (error) {
      throw new Error('Failed to generate assignments')
    } finally {
      isLoading.value = false
    }
  }

  const sendInvitation = async (email, message) => {
    isLoading.value = true
    try {
      // Mock email sending
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // In a real app, this would send an actual email
      console.log(`Sending invitation to ${email}: ${message}`)
      
      return {
        success: true,
        message: `Invitation sent to ${email}`
      }
    } catch (error) {
      throw new Error('Failed to send invitation')
    } finally {
      isLoading.value = false
    }
  }

  const getAssignmentDetails = async (assignmentId) => {
    isLoading.value = true
    try {
      // Mock API call to get assignment details
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mock assignment details
      const mockAssignment = {
        id: assignmentId,
        name: 'Jane Smith',
        email: 'jane@example.com',
        christmasListItems: [
          {
            id: 1,
            name: 'Cozy Winter Sweater',
            url: 'https://example.com/sweater',
            description: 'Size M, preferably in blue or green'
          },
          {
            id: 2,
            name: 'Good Book',
            description: 'Fantasy or mystery genre preferred'
          }
        ]
      }
      
      return mockAssignment
    } catch (error) {
      throw new Error('Failed to get assignment details')
    } finally {
      isLoading.value = false
    }
  }

  const clearAssignment = () => {
    assignment.value = null
    localStorage.removeItem('secretSantaAssignment')
  }

  const clearAllData = () => {
    participants.value = []
    assignment.value = null
    event.value = null
    localStorage.removeItem('secretSantaParticipants')
    localStorage.removeItem('secretSantaAssignment')
    localStorage.removeItem('secretSantaEvent')
  }

  return {
    // State
    participants,
    assignment,
    isLoading,
    event,
    
    // Getters
    hasAssignment,
    participantCount,
    
    // Actions
    loadSecretSantaData,
    createSecretSantaEvent,
    addParticipant,
    generateAssignments,
    sendInvitation,
    getAssignmentDetails,
    clearAssignment,
    clearAllData
  }
})