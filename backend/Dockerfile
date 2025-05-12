FROM python:3.11-slim

WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies and cryptography package
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir cryptography

# Copy application code
COPY . .

# Make the startup script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 8000

# Run the startup script
CMD ["./start.sh"] 