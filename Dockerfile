# === Frontend Build ===
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build
# Verify the build output
RUN ls -la dist/ || ls -la build/ || echo "No dist or build folder found"

# === Backend Build ===
FROM openjdk:17-jdk-alpine AS backend-build
WORKDIR /app/backend
COPY backend/mvnw backend/mvnw.cmd backend/pom.xml ./
COPY backend/.mvn .mvn
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B
COPY backend/src src
RUN ./mvnw package -DskipTests

# === Final Stage ===
FROM openjdk:17-jdk-alpine

# Install required packages
RUN apk add --no-cache nginx supervisor bash curl

# Create required directories
RUN mkdir -p /run/nginx /var/log/supervisor /usr/share/nginx/html

# Copy frontend build (check both dist and build folders)
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html 2>/dev/null || \
     COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html 2>/dev/null || \
     echo "Frontend build not found"

# Create a fallback index.html if frontend build failed
RUN if [ ! -f /usr/share/nginx/html/index.html ]; then \
        echo '<!DOCTYPE html><html><body><h1>Frontend not built correctly</h1></body></html>' > /usr/share/nginx/html/index.html; \
    fi

# Copy backend JAR
COPY --from=backend-build /app/backend/target/*.jar /app/backend.jar

# Remove ALL default nginx configs
RUN rm -rf /etc/nginx/conf.d/* /etc/nginx/sites-enabled/* /etc/nginx/sites-available/*

# Create main nginx.conf
RUN cat > /etc/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /run/nginx/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    keepalive_timeout 65;

    server {
        listen 80;
        server_name _;

        root /usr/share/nginx/html;
        index index.html index.htm;

        # Frontend routes
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy to Spring Boot
        location /api/ {
            proxy_pass http://localhost:8080;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
EOF

# Create supervisord configuration
RUN cat > /etc/supervisord.conf << 'EOF'
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:backend]
command=java -jar /app/backend.jar --server.port=8080
directory=/
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
priority=10

[program:nginx]
command=/usr/sbin/nginx -g "daemon off;"
directory=/
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
priority=20
depends_on=backend
EOF

# Test nginx configuration
RUN nginx -t

# Create a startup check script
RUN cat > /health-check.sh << 'EOF'
#!/bin/bash
# Wait for backend to be ready
echo "Waiting for backend to start..."
for i in {1..30}; do
    if curl -f http://localhost:8080/api/health 2>/dev/null || curl -f http://localhost:8080/ 2>/dev/null; then
        echo "Backend is ready!"
        break
    fi
    echo "Waiting for backend... ($i/30)"
    sleep 2
done

# Check if nginx is running
if pgrep nginx > /dev/null; then
    echo "Nginx is running"
else
    echo "Nginx is not running!"
fi
EOF
RUN chmod +x /health-check.sh

# Verify setup
RUN echo "=== Verifying frontend files ===" && \
    ls -la /usr/share/nginx/html/ && \
    echo "=== Verifying nginx config ===" && \
    nginx -t

EXPOSE 80

# Use exec form to ensure proper signal handling
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]