import express from 'express'
import { body, validationResult } from 'express-validator'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../database/init.js'
import { authenticateToken } from '../middleware/auth.js'
import { sendInvitationEmail, sendAssignmentEmail } from '../services/emailService.js'

const router = express.Router()

// Validation rules
const createEventValidation = [
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Event name is required and must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('exchange_date').optional().isISO8601().withMessage('Exchange date must be a valid date'),
  body('budget_limit').optional().isFloat({ min: 0 }).withMessage('Budget limit must be a positive number'),
]

const inviteValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
]

// GET /api/secret-santa/events - Get user's events
router.get('/events', authenticateToken, async (req, res) => {
  try {
    // Get events where user is organizer or participant
    const events = await db.allAsync(`
      SELECT DISTINCT e.*, u.name as organizer_name,
        CASE WHEN e.organizer_id = ? THEN 1 ELSE 0 END as is_organizer
      FROM secret_santa_events e
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN event_participants ep ON e.id = ep.event_id
      WHERE e.organizer_id = ? OR (ep.user_id = ? AND ep.has_joined = 1)
      ORDER BY e.created_at DESC
    `, [req.user.id, req.user.id, req.user.id])

    res.json({ events })

  } catch (error) {
    console.error('Get events error:', error)
    res.status(500).json({ error: 'Failed to get events' })
  }
})

// POST /api/secret-santa/events - Create new Secret Santa event
router.post('/events', authenticateToken, createEventValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      })
    }

    const { name, description, exchange_date, budget_limit } = req.body
    const organizerId = req.user.id

    // Create event
    const result = await db.runAsync(
      'INSERT INTO secret_santa_events (name, description, organizer_id, exchange_date, budget_limit) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, organizerId, exchange_date || null, budget_limit || null]
    )

    // Get the created event
    const newEvent = await db.getAsync(
      'SELECT * FROM secret_santa_events WHERE id = ?',
      [result.lastID]
    )

    res.status(201).json({
      message: 'Secret Santa event created successfully',
      event: newEvent
    })

  } catch (error) {
    console.error('Create event error:', error)
    res.status(500).json({ error: 'Failed to create event' })
  }
})

// GET /api/secret-santa/events/:id - Get specific event details
router.get('/events/:id', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id
    const userId = req.user.id

    // Get event details
    const event = await db.getAsync(`
      SELECT e.*, u.name as organizer_name
      FROM secret_santa_events e
      JOIN users u ON e.organizer_id = u.id
      WHERE e.id = ?
    `, [eventId])

    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    // Check if user has access (organizer or participant)
    const hasAccess = event.organizer_id === userId || await db.getAsync(
      'SELECT id FROM event_participants WHERE event_id = ? AND user_id = ? AND has_joined = 1',
      [eventId, userId]
    )

    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this event' })
    }

    // Get participants
    const participants = await db.allAsync(`
      SELECT u.id, u.name, u.email, u.profile_picture_url, ep.has_joined, ep.invited_at, ep.joined_at
      FROM event_participants ep
      JOIN users u ON ep.user_id = u.id
      WHERE ep.event_id = ?
      ORDER BY ep.invited_at ASC
    `, [eventId])

    // Get user's assignment if assignments are generated
    let assignment = null
    if (event.assignments_generated) {
      const assignmentData = await db.getAsync(`
        SELECT u.id, u.name
        FROM secret_santa_assignments sa
        JOIN users u ON sa.receiver_id = u.id
        WHERE sa.event_id = ? AND sa.giver_id = ?
      `, [eventId, userId])
      
      if (assignmentData) {
        assignment = assignmentData
      }
    }

    res.json({
      event,
      participants,
      assignment,
      is_organizer: event.organizer_id === userId
    })

  } catch (error) {
    console.error('Get event details error:', error)
    res.status(500).json({ error: 'Failed to get event details' })
  }
})

// POST /api/secret-santa/events/:id/invite - Send invitation
router.post('/events/:id/invite', authenticateToken, inviteValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      })
    }

    const eventId = req.params.id
    const { email } = req.body
    const userId = req.user.id

    // Check if user is organizer
    const event = await db.getAsync(
      'SELECT * FROM secret_santa_events WHERE id = ? AND organizer_id = ?',
      [eventId, userId]
    )

    if (!event) {
      return res.status(404).json({ error: 'Event not found or you are not the organizer' })
    }

    // Check if user exists in the system
    let invitedUser = await db.getAsync('SELECT id, name FROM users WHERE email = ?', [email])
    
    if (invitedUser) {
      // User exists - check if already participant
      const existingParticipant = await db.getAsync(
        'SELECT id FROM event_participants WHERE event_id = ? AND user_id = ?',
        [eventId, invitedUser.id]
      )

      if (existingParticipant) {
        return res.status(400).json({ error: 'User is already invited to this event' })
      }

      // Add as participant
      await db.runAsync(
        'INSERT INTO event_participants (event_id, user_id, has_joined) VALUES (?, ?, 1)',
        [eventId, invitedUser.id]
      )

      res.json({ 
        message: 'User added to event successfully',
        user_exists: true 
      })
    } else {
      // User doesn't exist - create invitation
      const token = uuidv4()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      await db.runAsync(
        'INSERT INTO invitations (event_id, email, token, invited_by, expires_at) VALUES (?, ?, ?, ?, ?)',
        [eventId, email, token, userId, expiresAt.toISOString()]
      )

      // Send invitation email
      try {
        await sendInvitationEmail(email, req.user.name, event.name, token)
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError)
        // Don't fail the entire request if email fails
      }

      res.json({ 
        message: 'Invitation sent successfully',
        user_exists: false 
      })
    }

  } catch (error) {
    console.error('Send invitation error:', error)
    res.status(500).json({ error: 'Failed to send invitation' })
  }
})

// POST /api/secret-santa/events/:id/generate-assignments - Generate Secret Santa assignments
router.post('/events/:id/generate-assignments', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id
    const userId = req.user.id

    // Check if user is organizer
    const event = await db.getAsync(
      'SELECT * FROM secret_santa_events WHERE id = ? AND organizer_id = ?',
      [eventId, userId]
    )

    if (!event) {
      return res.status(404).json({ error: 'Event not found or you are not the organizer' })
    }

    if (event.assignments_generated) {
      return res.status(400).json({ error: 'Assignments have already been generated for this event' })
    }

    // Get all participants who have joined
    const participants = await db.allAsync(`
      SELECT u.id, u.name, u.email
      FROM event_participants ep
      JOIN users u ON ep.user_id = u.id
      WHERE ep.event_id = ? AND ep.has_joined = 1
    `, [eventId])

    if (participants.length < 3) {
      return res.status(400).json({ error: 'Need at least 3 participants to generate assignments' })
    }

    // Simple assignment algorithm (shuffle and pair in circle)
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    const assignments = []

    for (let i = 0; i < shuffled.length; i++) {
      const giver = shuffled[i]
      const receiver = shuffled[(i + 1) % shuffled.length] // Circular assignment
      
      assignments.push({
        giver_id: giver.id,
        receiver_id: receiver.id,
        giver_name: giver.name,
        giver_email: giver.email,
        receiver_name: receiver.name
      })
    }

    // Save assignments to database
    for (const assignment of assignments) {
      await db.runAsync(
        'INSERT INTO secret_santa_assignments (event_id, giver_id, receiver_id) VALUES (?, ?, ?)',
        [eventId, assignment.giver_id, assignment.receiver_id]
      )
    }

    // Mark event as having assignments generated
    await db.runAsync(
      'UPDATE secret_santa_events SET assignments_generated = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [eventId]
    )

    // Send assignment emails to all participants
    for (const assignment of assignments) {
      try {
        await sendAssignmentEmail(
          assignment.giver_email,
          assignment.giver_name,
          assignment.receiver_name,
          event.name
        )
      } catch (emailError) {
        console.error(`Failed to send assignment email to ${assignment.giver_email}:`, emailError)
        // Continue with other emails even if one fails
      }
    }

    res.json({
      message: 'Secret Santa assignments generated successfully',
      assignments_count: assignments.length
    })

  } catch (error) {
    console.error('Generate assignments error:', error)
    res.status(500).json({ error: 'Failed to generate assignments' })
  }
})

// GET /api/secret-santa/my-assignment/:eventId - Get user's assignment for specific event
router.get('/my-assignment/:eventId', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.eventId
    const userId = req.user.id

    // Check if user is participant in the event
    const participant = await db.getAsync(
      'SELECT id FROM event_participants WHERE event_id = ? AND user_id = ? AND has_joined = 1',
      [eventId, userId]
    )

    if (!participant) {
      return res.status(403).json({ error: 'You are not a participant in this event' })
    }

    // Get assignment
    const assignment = await db.getAsync(`
      SELECT u.id, u.name, u.profile_picture_url
      FROM secret_santa_assignments sa
      JOIN users u ON sa.receiver_id = u.id
      WHERE sa.event_id = ? AND sa.giver_id = ?
    `, [eventId, userId])

    if (!assignment) {
      return res.status(404).json({ error: 'No assignment found. Assignments may not have been generated yet.' })
    }

    // Get receiver's Christmas list
    const christmasItems = await db.allAsync(
      'SELECT id, name, url, description, created_at FROM christmas_list_items WHERE user_id = ? ORDER BY created_at DESC',
      [assignment.id]
    )

    res.json({
      assignment: {
        ...assignment,
        christmas_items: christmasItems
      }
    })

  } catch (error) {
    console.error('Get assignment error:', error)
    res.status(500).json({ error: 'Failed to get assignment' })
  }
})

export default router