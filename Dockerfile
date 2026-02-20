# Use lightweight Python image
FROM python:3.11-alpine

# Set working directory
WORKDIR /app

# Copy all files (includes generated config.js)
COPY . .

# Set Cloud Run port
ENV PORT 8080

# Expose port
EXPOSE 8080

# Start simple HTTP server
CMD ["sh", "-c", "python -m http.server $PORT"]
