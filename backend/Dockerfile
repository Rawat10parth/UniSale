# Use a more compatible Python image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONUNBUFFERED=True
ENV PORT=8080

# Set working directory
WORKDIR /app

# Copy requirements first for better layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Command to run the application
# Note: Using environment variable with exec form
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app