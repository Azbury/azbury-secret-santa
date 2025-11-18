import jwt from 'jsonwebtoken'
import { db } from '../database/init.js'

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get user from database to ensure they still exist
    const user = await db.getAsync(
      'SELECT id, name, email, profile_picture_url, bio, created_at FROM users WHERE id = ?',
      [decoded.userId]
    )

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    req.user = null
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await db.getAsync(
      'SELECT id, name, email, profile_picture_url, bio, created_at FROM users WHERE id = ?',
      [decoded.userId]
    )
    req.user = user
  } catch (error) {
    req.user = null
  }

  next()
}

