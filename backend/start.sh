#!/bin/bash

echo "🚀 Starting CRM Backend..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env and configure your database settings"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Check if database is accessible
echo "🔍 Checking database connection..."
npm run db:push

# Seed database if needed
echo "🌱 Seeding database..."
npm run db:seed

# Start development server
echo "🔥 Starting development server..."
npm run dev
