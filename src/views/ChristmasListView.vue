<template>
  <div class="christmas-list">
    <div class="container">
      <header class="list-header">
        <h1>🎁 My Christmas List</h1>
        <p>Add items you'd love to receive this Christmas</p>
        <button @click="openAddForm" class="btn btn-primary">
          + Add Item
        </button>
      </header>
      
      <!-- Add Item Form -->
      <div v-if="showAddForm" class="add-form-overlay">
        <div class="add-form">
          <h3>{{ editingItem ? 'Edit Christmas List Item' : 'Add Christmas List Item' }}</h3>
          <form @submit.prevent="editingItem ? updateItem() : addItem()">
            <div class="form-group">
              <label for="itemName">Item Name *</label>
              <input
                id="itemName"
                v-model="newItem.name"
                type="text"
                required
                placeholder="What would you like?"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="itemUrl">URL (Optional)</label>
              <input
                id="itemUrl"
                v-model="newItem.url"
                type="url"
                placeholder="Link to the item (optional)"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="itemDescription">Description (Optional)</label>
              <textarea
                id="itemDescription"
                v-model="newItem.description"
                placeholder="Any additional details..."
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-buttons">
              <button type="submit" class="btn btn-primary">
                {{ editingItem ? 'Update Item' : 'Add Item' }}
              </button>
              <button type="button" @click="cancelAdd" class="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- List Items -->
      <div class="items-grid">
        <div v-for="item in christmasListStore.items" :key="item.id" class="item-card">
          <div class="item-header">
            <h3>{{ item.name }}</h3>
            <div class="item-actions">
              <button @click="editItem(item)" class="btn-icon" title="Edit">
                ✏️
              </button>
              <button @click="deleteItem(item.id)" class="btn-icon" title="Delete">
                🗑️
              </button>
            </div>
          </div>
          
          <p v-if="item.description" class="item-description">
            {{ item.description }}
          </p>
          
          <div v-if="item.url" class="item-link">
            <a :href="item.url" target="_blank" rel="noopener noreferrer" class="link">
              🔗 View Item
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useChristmasListStore } from '../stores/christmasList'

const christmasListStore = useChristmasListStore()

// Load fresh data when component mounts
onMounted(() => {
  christmasListStore.loadItems()
})

const showAddForm = ref(false)
const editingItem = ref(null)

const newItem = reactive({
  name: '',
  url: '',
  description: ''
})

const addItem = () => {
  if (newItem.name.trim()) {
    christmasListStore.addItem({
      name: newItem.name.trim(),
      url: newItem.url.trim() || null,
      description: newItem.description.trim() || null
    })
    
    // Reset form
    resetForm()
  }
}

const updateItem = () => {
  if (newItem.name.trim() && editingItem.value) {
    christmasListStore.updateItem(editingItem.value.id, {
      name: newItem.name.trim(),
      url: newItem.url.trim() || null,
      description: newItem.description.trim() || null
    })
    
    // Reset form
    resetForm()
  }
}

const resetForm = () => {
  newItem.name = ''
  newItem.url = ''
  newItem.description = ''
  showAddForm.value = false
  editingItem.value = null
}

const openAddForm = () => {
  // Clear any existing edit state and open form for adding
  editingItem.value = null
  newItem.name = ''
  newItem.url = ''
  newItem.description = ''
  showAddForm.value = true
}

const cancelAdd = () => {
  resetForm()
}

const editItem = (item) => {
  newItem.name = item.name
  newItem.url = item.url || ''
  newItem.description = item.description || ''
  editingItem.value = item
  showAddForm.value = true
}

const deleteItem = (itemId) => {
  if (confirm('Are you sure you want to delete this item?')) {
    christmasListStore.removeItem(itemId)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.christmas-list {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.list-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.list-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.list-header p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 20px;
}

.add-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.add-form {
  background: white;
  padding: 30px;
  border-radius: 15px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.add-form h3 {
  margin-bottom: 20px;
  color: #2d3748;
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

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.item-card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.item-header h3 {
  color: #2d3748;
  margin: 0;
  flex: 1;
}

.item-actions {
  display: flex;
  gap: 5px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-icon:hover {
  background: #f1f5f9;
}

.item-description {
  color: #718096;
  margin-bottom: 15px;
  line-height: 1.5;
}

.item-link {
  margin-bottom: 15px;
}

.item-footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 10px;
}

.item-date {
  color: #a0aec0;
  font-size: 0.9rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: white;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.empty-state p {
  opacity: 0.9;
  margin-bottom: 30px;
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

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}
</style>