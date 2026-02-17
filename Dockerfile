# Use lightweight NGINX image
FROM nginx:alpine

# Remove default HTML
RUN rm -rf /usr/share/nginx/html/*

# Copy frontend build files
COPY . /usr/share/nginx/html

# Set default port for Cloud Run
ENV PORT 8080

# Update NGINX config to listen on the runtime PORT
RUN sed -i 's/listen 80;/listen ${PORT};/' /etc/nginx/conf.d/default.conf

# Expose the port
EXPOSE 8080

# Start NGINX with runtime env substitution
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"

