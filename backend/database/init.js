import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Enable verbose mode for debugging
sqlite3.verbose()

// Create database connection
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite')
const db = new sqlite3.Database(dbPath)

// Promisify database methods
db.runAsync = promisify(db.run.bind(db))
db.getAsync = promisify(db.get.bind(db))
db.allAsync = promisify(db.all.bind(db))

export { db }

export async function initializeDatabase() {
  try {
    // Enable foreign keys
    await db.runAsync('PRAGMA foreign_keys = ON')
    
    // Create users table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        profile_picture_url TEXT,
        bio TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create Christmas lists table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS christmas_list_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        url TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `)

    // Create Secret Santa events table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS secret_santa_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        organizer_id INTEGER NOT NULL,
        exchange_date DATE,
        budget_limit DECIMAL(10, 2),
        assignments_generated BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizer_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `)

    // Create participants table (many-to-many relationship)
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS event_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        has_joined BOOLEAN DEFAULT FALSE,
        invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        joined_at DATETIME,
        FOREIGN KEY (event_id) REFERENCES secret_santa_events (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(event_id, user_id)
      )
    `)

    // Create assignments table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS secret_santa_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        giver_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES secret_santa_events (id) ON DELETE CASCADE,
        FOREIGN KEY (giver_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(event_id, giver_id),
        UNIQUE(event_id, receiver_id)
      )
    `)

    // Create invitations table for tracking email invitations
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS invitations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        invited_by INTEGER NOT NULL,
        accepted BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY (event_id) REFERENCES secret_santa_events (id) ON DELETE CASCADE,
        FOREIGN KEY (invited_by) REFERENCES users (id) ON DELETE CASCADE
      )
    `)

    // Create indexes for better performance
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)')
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_christmas_items_user ON christmas_list_items (user_id)')
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_participants_event ON event_participants (event_id)')
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_participants_user ON event_participants (user_id)')
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_assignments_event ON secret_santa_assignments (event_id)')
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_assignments_giver ON secret_santa_assignments (giver_id)')
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations (token)')

    console.log('Database tables created successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}