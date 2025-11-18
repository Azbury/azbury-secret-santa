# 🎅 Secret Santa Full-Stack Application

A modern Vue 3 + Node.js Secret Santa web application with real authentication, database persistence, and email invitations.

## 🏗️ Architecture

### Frontend (Vue 3)
- **Vue 3** with Composition API
- **Pinia** for state management  
- **Vue Router** for navigation
- **Vite** for development and building

### Backend (Node.js)
- **Express.js** REST API
- **SQLite** database with proper schema
- **JWT** authentication with bcrypt password hashing
- **Nodemailer** for real email sending
- **Multer** for file uploads (profile pictures)

## 🚀 Quick Start

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

Or use the setup script:
- **Windows:** Run `setup-backend.bat`
- **Mac/Linux:** Run `./setup-backend.sh`

### 2. Configure Environment

Copy and edit the backend environment file:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your settings:
```env
# Required
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional - Email Configuration (for real email sending)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Secret Santa <your-email@gmail.com>
```

### 3. Start the Servers

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:3001

**Frontend (Terminal 2):**
```bash
npm run dev
```
Frontend runs on: http://localhost:5173

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Sign out

### Christmas Lists
- `GET /api/christmas-lists` - Get user's items
- `POST /api/christmas-lists` - Add item
- `PUT /api/christmas-lists/:id` - Update item
- `DELETE /api/christmas-lists/:id` - Delete item

### Secret Santa
- `GET /api/secret-santa/events` - Get user's events
- `POST /api/secret-santa/events` - Create event
- `POST /api/secret-santa/events/:id/invite` - Send invitation
- `POST /api/secret-santa/events/:id/generate-assignments` - Generate assignments

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/:id/christmas-list` - View someone's list

## 🎯 Key Features

### ✅ Implemented
- **Secure Authentication** with JWT tokens and bcrypt
- **Real Database** with SQLite (production-ready with PostgreSQL)
- **Christmas List Management** with CRUD operations
- **Secret Santa Events** with participant management
- **Email Invitations** (configurable - mock or real SMTP)
- **Assignment Generation** with circular algorithm
- **Profile Management** with bio and settings
- **Responsive Design** for mobile and desktop

This is now a production-ready Secret Santa application! 🎅✨

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
