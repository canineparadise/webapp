#!/bin/bash

# Canine Paradise - Safe Dev Server Startup Script
# This script ensures only ONE dev server runs at a time

echo "🐕 Canine Paradise - Starting Dev Server"
echo "=========================================="

# Step 1: Kill any existing processes on port 3000
echo "📍 Checking for existing processes on port 3000..."
if lsof -ti:3000 >/dev/null 2>&1; then
  echo "⚠️  Found process on port 3000. Killing it..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null
  sleep 2
  echo "✅ Port 3000 cleared"
else
  echo "✅ Port 3000 is free"
fi

# Step 2: Clean build cache
echo "🧹 Cleaning build cache..."
rm -rf .next
echo "✅ Build cache cleaned"

# Step 3: Start dev server
echo "🚀 Starting Next.js dev server..."
echo "📱 Server will be available at: http://localhost:3000"
echo "⏹️  Press Ctrl+C to stop the server"
echo "=========================================="
npm run dev
