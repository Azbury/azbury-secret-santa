import express from 'express'
import { body, validationResult } from 'express-validator'
import { db } from '../database/init.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Validation rules
const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be less than 100 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
]

// GET /api/users/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to get profile' })
  }
})

// PUT /api/users/profile
router.put('/profile', authenticateToken, updateProfileValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      })
    }

    const { name, email, bio } = req.body
    const userId = req.user.id

    // If email is being changed, check if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await db.getAsync('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId])
      if (existingUser) {
        return res.status(400).json({ 
          error: 'This email is already in use by another account' 
        })
      }
    }

    // Build update query dynamically
    const updates = []
    const values = []

    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name)
    }
    if (email !== undefined) {
      updates.push('email = ?')
      values.push(email)
    }
    if (bio !== undefined) {
      updates.push('bio = ?')
      values.push(bio)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' })
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(userId)

    // Update user
    await db.runAsync(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    // Get updated user
    const updatedUser = await db.getAsync(
      'SELECT id, name, email, profile_picture_url, bio, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    )

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// GET /api/users/:id/christmas-list (public endpoint for Secret Santa viewing)
router.get('/:id/christmas-list', async (req, res) => {
  try {
    const userId = req.params.id

    // Get user info (public data only)
    const user = await db.getAsync(
      'SELECT id, name, profile_picture_url FROM users WHERE id = ?',
      [userId]
    )

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get Christmas list items
    const items = await db.allAsync(
      'SELECT id, name, url, description, created_at FROM christmas_list_items WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    )

    res.json({
      user,
      items
    })

  } catch (error) {
    console.error('Get user Christmas list error:', error)
    res.status(500).json({ error: 'Failed to get Christmas list' })
  }
})

export default router