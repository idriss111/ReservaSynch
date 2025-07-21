# === Frontend Build ===
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

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

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy backend JAR
COPY --from=backend-build /app/backend/target/*.jar /app/backend.jar

# Create nginx configuration file
RUN printf '%s\n' \
    'user nginx;' \
    'worker_processes auto;' \
    'error_log /var/log/nginx/error.log warn;' \
    'pid /run/nginx/nginx.pid;' \
    '' \
    'events {' \
    '    worker_connections 1024;' \
    '}' \
    '' \
    'http {' \
    '    include /etc/nginx/mime.types;' \
    '    default_type application/octet-stream;' \
    '    sendfile on;' \
    '    keepalive_timeout 65;' \
    '' \
    '    server {' \
    '        listen 80;' \
    '        server_name _;' \
    '        root /usr/share/nginx/html;' \
    '        index index.html;' \
    '' \
    '        location / {' \
    '            try_files $uri $uri/ /index.html;' \
    '        }' \
    '' \
    '        location /api/ {' \
    '            proxy_pass http://localhost:8080;' \
    '            proxy_set_header Host $host;' \
    '            proxy_set_header X-Real-IP $remote_addr;' \
    '            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \
    '            proxy_set_header X-Forwarded-Proto $scheme;' \
    '        }' \
    '    }' \
    '}' \
    > /etc/nginx/nginx.conf

# Create supervisord configuration
RUN printf '%s\n' \
    '[supervisord]' \
    'nodaemon=true' \
    'user=root' \
    '' \
    '[program:backend]' \
    'command=java -jar /app/backend.jar --server.port=8080' \
    'autostart=true' \
    'autorestart=true' \
    'stdout_logfile=/dev/stdout' \
    'stdout_logfile_maxbytes=0' \
    'stderr_logfile=/dev/stderr' \
    'stderr_logfile_maxbytes=0' \
    'priority=10' \
    '' \
    '[program:nginx]' \
    'command=nginx -g "daemon off;"' \
    'autostart=true' \
    'autorestart=true' \
    'stdout_logfile=/dev/stdout' \
    'stdout_logfile_maxbytes=0' \
    'stderr_logfile=/dev/stderr' \
    'stderr_logfile_maxbytes=0' \
    'priority=20' \
    > /etc/supervisord.conf

# Verify nginx configuration
RUN nginx -t

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]