#!/bin/bash
set -e

# Create MySQL database
echo "Creating MySQL database..."
python create_mysql_db.py

# Initialize databases
echo "Initializing databases..."
python init_db.py

# Start the application
echo "Starting FastAPI application..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 