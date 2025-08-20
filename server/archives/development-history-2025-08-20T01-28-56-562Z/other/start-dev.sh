#!/bin/bash

# Set environment variables
export PORT=3000
export NODE_ENV=development
export DATABASE_URL="file:./dev.db"
export JWT_SECRET="your_jwt_secret_here"
export JWT_EXPIRES_IN="7d"

# Install dependencies if needed
npm install

# Start the server
npm run dev
