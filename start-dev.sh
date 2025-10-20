#!/bin/bash

# Kill any existing dev servers
echo "Stopping any existing dev servers..."
pkill -9 node 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "npm run dev" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Wait a moment
sleep 2

# Clean build
echo "Cleaning .next directory..."
rm -rf .next

# Start dev server
echo "Starting dev server..."
npm run dev
