<template>
  <div class="secret-santa">
    <div class="container">
      <header class="header">
        <h1>🎅 Secret Santa Manager</h1>
        <p>Organize your Secret Santa event and manage participants</p>
      </header>
      
      <!-- Create Event Section -->
      <div v-if="!secretSantaStore.event" class="create-event-section">
        <div class="card">
          <h2>Create Secret Santa Event</h2>
          <form @submit.prevent="createEvent">
            <div class="form-group">
              <label for="eventName">Event Name</label>
              <input
                id="eventName"
                v-model="eventForm.name"
                type="text"
                required
                placeholder="Christmas 2024 Secret Santa"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="eventDescription">Description</label>
              <textarea
                id="eventDescription"
                v-model="eventForm.description"
                placeholder="Tell participants about your Secret Santa event..."
                class="form-input"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="eventDate">Exchange Date</label>
                <input
                  id="eventDate"
                  v-model="eventForm.date"
                  type="date"
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="eventBudget">Budget Limit</label>
                <input
                  id="eventBudget"
                  v-model="eventForm.budget"
                  type="number"
                  min="0"
                  step="5"
                  placeholder="50"
                  class="form-input"
                />
              </div>
            </div>
            
            <button type="submit" class="btn btn-primary" :disabled="secretSantaStore.isLoading">
              {{ secretSantaStore.isLoading ? 'Creating...' : 'Create Event' }}
            </button>
          </form>
        </div>
      </div>
      
      <!-- Event Management Section -->
      <div v-else class="event-management">
        <div class="event-info card">
          <h2>{{ secretSantaStore.event.name }}</h2>
          <p v-if="secretSantaStore.event.description">{{ secretSantaStore.event.description }}</p>
          <div class="event-details">
            <div v-if="secretSantaStore.event.date" class="detail">
              <strong>Date:</strong> {{ formatDate(secretSantaStore.event.date) }}
            </div>
            <div v-if="secretSantaStore.event.budget" class="detail">
              <strong>Budget:</strong> ${{ secretSantaStore.event.budget }}
            </div>
            <div class="detail">
              <strong>Participants:</strong> {{ secretSantaStore.participantCount }}
            </div>
          </div>
        </div>
        
        <!-- Invite Participants -->
        <div class="invite-section card">
          <h3>Invite Participants</h3>
          <div class="invite-form">
            <input
              v-model="inviteForm.email"
              type="email"
              placeholder="Friend's email address"
              class="form-input"
            />
            <button @click="sendInvite" class="btn btn-primary" :disabled="!inviteForm.email">
              Send Invite
            </button>
          </div>
          
          <div class="bulk-invite">
            <h4>Or invite multiple people at once:</h4>
            <textarea
              v-model="bulkEmails"
              placeholder="Enter multiple email addresses, one per line"
              class="form-input"
              rows="4"
            ></textarea>
            <button @click="sendBulkInvites" class="btn btn-secondary" :disabled="!bulkEmails.trim()">
              Send Bulk Invites
            </button>
          </div>
        </div>
        
        <!-- Participants List -->
        <div class="participants-section card">
          <h3>Participants ({{ secretSantaStore.participantCount }})</h3>
          
          <div v-if="secretSantaStore.participants.length === 0" class="empty-state">
            <p>No participants yet. Start inviting people!</p>
          </div>
          
          <div v-else class="participants-list">
            <div v-for="participant in secretSantaStore.participants" :key="participant.id" class="participant-card">
              <div class="participant-info">
                <h4>{{ participant.name }}</h4>
                <p>{{ participant.email }}</p>
                <span :class="['status', participant.hasJoined ? 'joined' : 'pending']">
                  {{ participant.hasJoined ? 'Joined' : 'Pending' }}
                </span>
              </div>
              <div class="participant-actions">
                <button @click="resendInvite(participant.email)" class="btn btn-small">
                  Resend Invite
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="secretSantaStore.participantCount >= 3" class="generate-section">
            <button @click="generateAssignments" class="btn btn-accent" :disabled="secretSantaStore.isLoading">
              {{ secretSantaStore.isLoading ? 'Generating...' : 'Generate Secret Santa Assignments' }}
            </button>
            <p class="note">All participants will receive their assignments via email.</p>
          </div>
        </div>
        
        <!-- Your Assignment -->
        <div v-if="secretSantaStore.hasAssignment" class="assignment-section card">
          <h3>🎁 Your Secret Santa Assignment</h3>
          <div class="assignment-info">
            <h4>You're Secret Santa for: {{ secretSantaStore.assignment.name }}</h4>
            <button @click="viewAssignmentWishlist" class="btn btn-primary">
              View Their Christmas List
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useSecretSantaStore } from '../stores/secretSanta'

const secretSantaStore = useSecretSantaStore()

const eventForm = reactive({
  name: '',
  description: '',
  date: '',
  budget: ''
})

const inviteForm = reactive({
  email: ''
})

const bulkEmails = ref('')

const createEvent = async () => {
  try {
    await secretSantaStore.createSecretSantaEvent(eventForm)
    // Reset form
    Object.keys(eventForm).forEach(key => eventForm[key] = '')
  } catch (error) {
    alert('Failed to create event: ' + error.message)
  }
}

const sendInvite = async () => {
  if (!inviteForm.email) return
  
  try {
    // Add participant to list
    await secretSantaStore.addParticipant({
      name: inviteForm.email.split('@')[0], // Use email prefix as temporary name
      email: inviteForm.email
    })
    
    // Send invitation
    await secretSantaStore.sendInvitation(
      inviteForm.email,
      `You're invited to join ${secretSantaStore.event.name}! Create your account and Christmas list.`
    )
    
    alert(`Invitation sent to ${inviteForm.email}!`)
    inviteForm.email = ''
  } catch (error) {
    alert('Failed to send invite: ' + error.message)
  }
}

const sendBulkInvites = async () => {
  const emails = bulkEmails.value.split('\n').filter(email => email.trim())
  
  for (const email of emails) {
    if (email.trim()) {
      try {
        await secretSantaStore.addParticipant({
          name: email.trim().split('@')[0],
          email: email.trim()
        })
        
        await secretSantaStore.sendInvitation(
          email.trim(),
          `You're invited to join ${secretSantaStore.event.name}! Create your account and Christmas list.`
        )
      } catch (error) {
        console.error(`Failed to invite ${email}:`, error)
      }
    }
  }
  
  alert(`Bulk invitations sent!`)
  bulkEmails.value = ''
}

const resendInvite = async (email) => {
  try {
    await secretSantaStore.sendInvitation(
      email,
      `Reminder: You're invited to join ${secretSantaStore.event.name}!`
    )
    alert(`Reminder sent to ${email}!`)
  } catch (error) {
    alert('Failed to resend invite: ' + error.message)
  }
}

const generateAssignments = async () => {
  try {
    await secretSantaStore.generateAssignments()
    alert('Secret Santa assignments generated! All participants have been notified.')
  } catch (error) {
    alert('Failed to generate assignments: ' + error.message)
  }
}

const viewAssignmentWishlist = () => {
  // In a real app, this would navigate to the assigned person's public wishlist
  alert(`Viewing ${secretSantaStore.assignment.name}'s Christmas list...`)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.secret-santa {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card h2, .card h3 {
  color: #2d3748;
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.event-details {
  display: flex;
  gap: 30px;
  margin-top: 15px;
}

.detail {
  color: #718096;
}

.invite-form {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.invite-form .form-input {
  flex: 1;
}

.bulk-invite h4 {
  color: #4a5568;
  margin-bottom: 10px;
  font-size: 1rem;
}

.participants-list {
  display: grid;
  gap: 15px;
}

.participant-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f9fafb;
}

.participant-info h4 {
  margin: 0 0 5px 0;
  color: #2d3748;
}

.participant-info p {
  margin: 0 0 5px 0;
  color: #718096;
  font-size: 0.9rem;
}

.status {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status.joined {
  background: #c6f6d5;
  color: #22543d;
}

.status.pending {
  background: #fed7d7;
  color: #742a2a;
}

.btn-small {
  padding: 6px 12px;
  font-size: 0.9rem;
}

.generate-section {
  margin-top: 30px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.generate-section .note {
  margin-top: 10px;
  color: #718096;
  font-size: 0.9rem;
}

.assignment-section {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.assignment-section h3,
.assignment-section h4 {
  color: white;
}

.assignment-info {
  text-align: center;
}

.assignment-info h4 {
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.btn-accent {
  background: #48bb78;
  color: white;
}

.btn-accent:hover {
  background: #38a169;
}

.empty-state {
  text-align: center;
  color: #718096;
  padding: 40px 20px;
}

.admin-notice {
  margin-bottom: 30px;
}

.notice-content {
  text-align: center;
  padding: 40px 20px;
}

.notice-content h2 {
  color: #e53e3e;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.notice-content p {
  color: #718096;
  font-size: 1.1rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .event-details {
    flex-direction: column;
    gap: 10px;
  }
  
  .invite-form {
    flex-direction: column;
  }
  
  .participant-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>