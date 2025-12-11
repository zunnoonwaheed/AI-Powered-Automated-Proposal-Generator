#!/bin/bash

# Script to run both frontend and backend concurrently
# Usage: ./dev.sh

echo "Starting Proposal-Perfect development servers..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo ""

# Run both frontend and backend using npm scripts
npm run dev
