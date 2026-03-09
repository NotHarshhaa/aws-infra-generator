#!/bin/bash

# AWS Infra Generator Backend Startup Script

echo "Starting AWS Infra Generator Backend..."

# Set environment variables
export ALLOWED_ORIGINS=${ALLOWED_ORIGINS:-"http://localhost:3000,http://localhost:3001"}
export LOG_LEVEL=${LOG_LEVEL:-"INFO"}

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the server
echo "Starting server on http://localhost:8000"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
