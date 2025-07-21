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

# Create main nginx.conf using echo commands (more reliable)
RUN echo 'user nginx;' > /etc/nginx/nginx.conf && \
    echo 'worker_processes auto;' >> /etc/nginx/nginx.conf && \
    echo 'error_log /var/log/nginx/error.log warn;' >> /etc/nginx/nginx.conf && \
    echo 'pid /run/nginx/nginx.pid;' >> /etc/nginx/nginx.conf && \
    echo '' >> /etc/nginx/nginx.conf && \
    echo 'events {' >> /etc/nginx/nginx.conf && \
    echo '    worker_connections 1024;' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf && \
    echo '' >> /etc/nginx/nginx.conf && \
    echo 'http {' >> /etc/nginx/nginx.conf && \
    echo '    include /etc/nginx/mime.types;' >> /etc/nginx/nginx.conf && \
    echo '    default_type application/octet-stream;' >> /etc/nginx/nginx.conf && \
    echo '    ' >> /etc/nginx/nginx.conf && \
    echo '    log_format main '\''$remote_addr - $remote_user [$time_local] "$request" '\''' >> /etc/nginx/nginx.conf && \
    echo '                    '\''$status $body_bytes_sent "$http_referer" '\''' >> /etc/nginx/nginx.conf && \
    echo '                    '\''"$http_user_agent" "$http_x_forwarded_for"'\'';' >> /etc/nginx/nginx.conf && \
    echo '    ' >> /etc/nginx/nginx.conf && \
    echo '    access_log /var/log/nginx/access.log main;' >> /etc/nginx/nginx.conf && \
    echo '    ' >> /etc/nginx/nginx.conf && \
    echo '    sendfile on;' >> /etc/nginx/nginx.conf && \
    echo '    keepalive_timeout 65;' >> /etc/nginx/nginx.conf && \
    echo '    ' >> /etc/nginx/nginx.conf && \
    echo '    server {' >> /etc/nginx/nginx.conf && \
    echo '        listen 80;' >> /etc/nginx/nginx.conf && \
    echo '        server_name _;' >> /etc/nginx/nginx.conf && \
    echo '        ' >> /etc/nginx/nginx.conf && \
    echo '        root /usr/share/nginx/html;' >> /etc/nginx/nginx.conf && \
    echo '        index index.html index.htm;' >> /etc/nginx/nginx.conf && \
    echo '        ' >> /etc/nginx/nginx.conf && \
    echo '        location / {' >> /etc/nginx/nginx.conf && \
    echo '            try_files $uri $uri/ /index.html;' >> /etc/nginx/nginx.conf && \
    echo '        }' >> /etc/nginx/nginx.conf && \
    echo '        ' >> /etc/nginx/nginx.conf && \
    echo '        location /api/ {' >> /etc/nginx/nginx.conf && \
    echo '            proxy_pass http://localhost:8080;' >> /etc/nginx/nginx.conf && \
    echo '            proxy_http_version 1.1;' >> /etc/nginx/nginx.conf && \
    echo '            proxy_set_header Upgrade $http_upgrade;' >> /etc/nginx/nginx.conf && \
    echo '            proxy_set_header Connection "upgrade";' >> /etc/nginx/nginx.conf && \
    echo '            proxy_set_header Host $host;' >> /etc/nginx/nginx.conf && \
    echo '            proxy_set_header X-Real-IP $remote_addr;' >> /etc/nginx/nginx.conf && \
    echo '            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' >> /etc/nginx/nginx.conf && \
    echo '            proxy_set_header X-Forwarded-Proto $scheme;' >> /etc/nginx/nginx.conf && \
    echo '            proxy_cache_bypass $http_upgrade;' >> /etc/nginx/nginx.conf && \
    echo '        }' >> /etc/nginx/nginx.conf && \
    echo '    }' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf

# Create supervisord configuration
RUN echo '[supervisord]' > /etc/supervisord.conf && \
    echo 'nodaemon=true' >> /etc/supervisord.conf && \
    echo 'user=root' >> /etc/supervisord.conf && \
    echo 'logfile=/var/log/supervisor/supervisord.log' >> /etc/supervisord.conf && \
    echo 'pidfile=/var/run/supervisord.pid' >> /etc/supervisord.conf && \
    echo '' >> /etc/supervisord.conf && \
    echo '[program:backend]' >> /etc/supervisord.conf && \
    echo 'command=java -jar /app/backend.jar --server.port=8080' >> /etc/supervisord.conf && \
    echo 'directory=/' >> /etc/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisord.conf && \
    echo 'stdout_logfile=/dev/stdout' >> /etc/supervisord.conf && \
    echo 'stdout_logfile_maxbytes=0' >> /etc/supervisord.conf && \
    echo 'stderr_logfile=/dev/stderr' >> /etc/supervisord.conf && \
    echo 'stderr_logfile_maxbytes=0' >> /etc/supervisord.conf && \
    echo 'priority=10' >> /etc/supervisord.conf && \
    echo '' >> /etc/supervisord.conf && \
    echo '[program:nginx]' >> /etc/supervisord.conf && \
    echo 'command=/usr/sbin/nginx -g "daemon off;"' >> /etc/supervisord.conf && \
    echo 'directory=/' >> /etc/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisord.conf && \
    echo 'stdout_logfile=/dev/stdout' >> /etc/supervisord.conf && \
    echo 'stdout_logfile_maxbytes=0' >> /etc/supervisord.conf && \
    echo 'stderr_logfile=/dev/stderr' >> /etc/supervisord.conf && \
    echo 'stderr_logfile_maxbytes=0' >> /etc/supervisord.conf && \
    echo 'priority=20' >> /etc/supervisord.conf

# Test nginx configuration
RUN nginx -t

# Verify setup
RUN echo "=== Verifying frontend files ===" && \
    ls -la /usr/share/nginx/html/ && \
    echo "=== Verifying nginx config ===" && \
    cat /etc/nginx/nginx.conf

EXPOSE 80

# Use exec form to ensure proper signal handling
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]