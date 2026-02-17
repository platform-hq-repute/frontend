# Use lightweight Python image
FROM python:3.11-alpine

# Set working directory
WORKDIR /app

# Copy frontend files
COPY . .

# Set Cloud Run port
ENV PORT 8080

# Expose port
EXPOSE 8080

# Start a simple HTTP server on $PORT
CMD ["sh", "-c", "python -m http.server $PORT"]
