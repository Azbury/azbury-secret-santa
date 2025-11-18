import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { db } from '../database/init.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
]

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').exists().withMessage('Password is required'),
]

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// POST /api/auth/register
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      })
    }

    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await db.getAsync('SELECT id FROM users WHERE email = ?', [email])
    if (existingUser) {
      return res.status(400).json({ 
        error: 'An account with this email already exists. Please sign in instead.' 
      })
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user in database
    await db.runAsync(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    )

    // Get the created user by email (since we just created it)
    const newUser = await db.getAsync(
      'SELECT id, name, email, profile_picture_url, bio, created_at FROM users WHERE email = ?',
      [email]
    )

    // Generate token
    const token = generateToken(newUser.id)

    res.status(201).json({
      message: 'Account created successfully',
      user: newUser,
      token
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Failed to create account' })
  }
})

// POST /api/auth/login
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      })
    }

    const { email, password } = req.body

    // Find user by email
    const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email])
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password. Please check your credentials or create an account.' 
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password. Please check your credentials or create an account.' 
      })
    }

    // Generate token
    const token = generateToken(user.id)

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user information' })
  }
})

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req, res) => {
  // With JWT tokens, logout is typically handled client-side
  // by removing the token from storage
  res.json({ message: 'Logout successful' })
})

export default router