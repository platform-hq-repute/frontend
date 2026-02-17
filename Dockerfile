FROM nginx:alpine

# Clear default html
RUN rm -rf /usr/share/nginx/html/*
COPY . /usr/share/nginx/html

# Use env variable for port
ENV PORT 8080
RUN sed -i "s/listen 80;/listen $PORT;/" /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
