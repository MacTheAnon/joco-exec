#!/bin/bash
echo "🚀 Starting Setup..."
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please download it from nodejs.org"
    exit
fi
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Dependencies..."
    npm install
fi
echo "✨ Starting Development Server..."
npm start
