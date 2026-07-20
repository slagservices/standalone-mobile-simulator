# Use a minimal Nginx image to serve plain static files
FROM nginx:alpine

# Copy our simple HTML/CSS/JS frontend to Nginx's public folder
COPY ./src /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Nginx automatically starts when the container runs
