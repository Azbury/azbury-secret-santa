#!/bin/bash

echo "🎅 Setting up Secret Santa Backend..."

# Install dependencies
cd backend
npm install

echo "✅ Dependencies installed!"

# Create uploads directory
mkdir -p uploads

echo "📁 Uploads directory created!"

echo "🚀 Backend setup complete!"
echo ""
echo "To start the backend server:"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Backend will run on: http://localhost:3001"
echo "Health check: http://localhost:3001/api/health"