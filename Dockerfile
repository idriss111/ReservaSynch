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

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy backend JAR
COPY --from=backend-build /app/backend/target/*.jar /app/backend.jar

# Create directories
RUN mkdir -p /etc/nginx/http.d /var/log/supervisor

# Create Nginx config - IMPORTANT: Remove default nginx config first
RUN rm -f /etc/nginx/http.d/default.conf && \
    rm -f /etc/nginx/conf.d/default.conf && \
    echo 'server {' > /etc/nginx/http.d/app.conf && \
    echo '    listen 80;' >> /etc/nginx/http.d/app.conf && \
    echo '    server_name _;' >> /etc/nginx/http.d/app.conf && \
    echo '    ' >> /etc/nginx/http.d/app.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/http.d/app.conf && \
    echo '    index index.html;' >> /etc/nginx/http.d/app.conf && \
    echo '    ' >> /etc/nginx/http.d/app.conf && \
    echo '    location / {' >> /etc/nginx/http.d/app.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/http.d/app.conf && \
    echo '    }' >> /etc/nginx/http.d/app.conf && \
    echo '    ' >> /etc/nginx/http.d/app.conf && \
    echo '    location /api/ {' >> /etc/nginx/http.d/app.conf && \
    echo '        proxy_pass http://127.0.0.1:8080;' >> /etc/nginx/http.d/app.conf && \
    echo '        proxy_http_version 1.1;' >> /etc/nginx/http.d/app.conf && \
    echo '        proxy_set_header Upgrade $http_upgrade;' >> /etc/nginx/http.d/app.conf && \
    echo '        proxy_set_header Connection "upgrade";' >> /etc/nginx/http.d/app.conf && \
    echo '        proxy_set_header Host $host;' >> /etc/nginx/http.d/app.conf && \
    echo '        proxy_set_header X-Real-IP $remote_addr;' >> /etc/nginx/http.d/app.conf && \
    echo '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' >> /etc/nginx/http.d/app.conf && \
    echo '        proxy_set_header X-Forwarded-Proto $scheme;' >> /etc/nginx/http.d/app.conf && \
    echo '        proxy_connect_timeout 60s;' >> /etc/nginx/http.d/app.conf && \
    echo '        proxy_send_timeout 60s;' >> /etc/nginx/http.d/app.conf && \
    echo '        proxy_read_timeout 60s;' >> /etc/nginx/http.d/app.conf && \
    echo '    }' >> /etc/nginx/http.d/app.conf && \
    echo '}' >> /etc/nginx/http.d/app.conf

# Create supervisord config
RUN echo '[supervisord]' > /etc/supervisord.conf && \
    echo 'nodaemon=true' >> /etc/supervisord.conf && \
    echo 'logfile=/var/log/supervisor/supervisord.log' >> /etc/supervisord.conf && \
    echo '' >> /etc/supervisord.conf && \
    echo '[program:backend]' >> /etc/supervisord.conf && \
    echo 'command=java -jar /app/backend.jar --server.port=8080' >> /etc/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisord.conf && \
    echo 'stdout_logfile=/dev/stdout' >> /etc/supervisord.conf && \
    echo 'stdout_logfile_maxbytes=0' >> /etc/supervisord.conf && \
    echo 'stderr_logfile=/dev/stderr' >> /etc/supervisord.conf && \
    echo 'stderr_logfile_maxbytes=0' >> /etc/supervisord.conf && \
    echo '' >> /etc/supervisord.conf && \
    echo '[program:nginx]' >> /etc/supervisord.conf && \
    echo 'command=nginx -g "daemon off;"' >> /etc/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisord.conf && \
    echo 'stdout_logfile=/dev/stdout' >> /etc/supervisord.conf && \
    echo 'stdout_logfile_maxbytes=0' >> /etc/supervisord.conf && \
    echo 'stderr_logfile=/dev/stderr' >> /etc/supervisord.conf && \
    echo 'stderr_logfile_maxbytes=0' >> /etc/supervisord.conf

# Verify frontend files exist
RUN ls -la /usr/share/nginx/html/

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]