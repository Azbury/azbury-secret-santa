import { defineStore } from 'pinia'
import { ref } from 'vue'
import { christmasListAPI } from '../services/api.js'

export const useChristmasListStore = defineStore('christmasList', () => {
  // State
  const items = ref([])
  const isLoading = ref(false)

  // Actions
  const loadItems = async () => {
    isLoading.value = true
    try {
      const response = await christmasListAPI.getItems()
      items.value = response.items
    } catch (error) {
      console.error('Failed to load Christmas list:', error)
      items.value = []
    } finally {
      isLoading.value = false
    }
  }

  const addItem = async (itemData) => {
    isLoading.value = true
    try {
      const response = await christmasListAPI.addItem(itemData)
      items.value.unshift(response.item) // Add to beginning of list
      return response.item
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateItem = async (itemId, itemData) => {
    isLoading.value = true
    try {
      const response = await christmasListAPI.updateItem(itemId, itemData)
      const index = items.value.findIndex(item => item.id === itemId)
      if (index !== -1) {
        items.value[index] = response.item
      }
      return response.item
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const removeItem = async (itemId) => {
    isLoading.value = true
    try {
      await christmasListAPI.deleteItem(itemId)
      const index = items.value.findIndex(item => item.id === itemId)
      if (index !== -1) {
        items.value.splice(index, 1)
      }
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const clearItems = () => {
    items.value = []
  }

  const getItemById = (itemId) => {
    return items.value.find(item => item.id === itemId)
  }

  const getItemsByCategory = (category) => {
    // This could be extended to support categories in the future
    return items.value
  }

  return {
    // State
    items,
    isLoading,
    
    // Actions
    loadItems,
    addItem,
    updateItem,
    removeItem,
    clearItems,
    getItemById,
    getItemsByCategory
  }
})