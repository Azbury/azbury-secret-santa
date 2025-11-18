import express from 'express'
import { body, validationResult } from 'express-validator'
import { db } from '../database/init.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Validation rules
const christmasItemValidation = [
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Item name is required and must be less than 200 characters'),
  body('url').optional({ checkFalsy: true }).isURL().withMessage('URL must be valid'),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
]

// GET /api/christmas-lists - Get current user's Christmas list
router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await db.allAsync(
      'SELECT id, name, url, description, created_at, updated_at FROM christmas_list_items WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    )

    res.json({
      items
    })

  } catch (error) {
    console.error('Get Christmas list error:', error)
    res.status(500).json({ error: 'Failed to get Christmas list' })
  }
})

// POST /api/christmas-lists - Add item to Christmas list
router.post('/', authenticateToken, christmasItemValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      })
    }

    const { name, url, description } = req.body
    const userId = req.user.id

    // Insert new item
    await db.runAsync(
      'INSERT INTO christmas_list_items (user_id, name, url, description) VALUES (?, ?, ?, ?)',
      [userId, name, url || null, description || null]
    )

    // Get the created item by user_id and name (most recently created)
    const newItem = await db.getAsync(
      'SELECT id, name, url, description, created_at, updated_at FROM christmas_list_items WHERE user_id = ? AND name = ? ORDER BY created_at DESC LIMIT 1',
      [userId, name]
    )

    res.status(201).json({
      message: 'Item added to Christmas list',
      item: newItem
    })

  } catch (error) {
    console.error('Add Christmas item error:', error)
    res.status(500).json({ error: 'Failed to add item to Christmas list' })
  }
})

// PUT /api/christmas-lists/:id - Update Christmas list item
router.put('/:id', authenticateToken, christmasItemValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      })
    }

    const itemId = req.params.id
    const { name, url, description } = req.body
    const userId = req.user.id

    // Check if item exists and belongs to user
    const existingItem = await db.getAsync(
      'SELECT id FROM christmas_list_items WHERE id = ? AND user_id = ?',
      [itemId, userId]
    )

    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found or you do not have permission to edit it' })
    }

    // Update item
    await db.runAsync(
      'UPDATE christmas_list_items SET name = ?, url = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, url || null, description || null, itemId]
    )

    // Get updated item
    const updatedItem = await db.getAsync(
      'SELECT id, name, url, description, created_at, updated_at FROM christmas_list_items WHERE id = ?',
      [itemId]
    )

    res.json({
      message: 'Item updated successfully',
      item: updatedItem
    })

  } catch (error) {
    console.error('Update Christmas item error:', error)
    res.status(500).json({ error: 'Failed to update item' })
  }
})

// DELETE /api/christmas-lists/:id - Delete Christmas list item
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const itemId = req.params.id
    const userId = req.user.id

    // Check if item exists and belongs to user
    const existingItem = await db.getAsync(
      'SELECT id FROM christmas_list_items WHERE id = ? AND user_id = ?',
      [itemId, userId]
    )

    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found or you do not have permission to delete it' })
    }

    // Delete item
    await db.runAsync('DELETE FROM christmas_list_items WHERE id = ?', [itemId])

    res.json({
      message: 'Item deleted successfully'
    })

  } catch (error) {
    console.error('Delete Christmas item error:', error)
    res.status(500).json({ error: 'Failed to delete item' })
  }
})

export default router