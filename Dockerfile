# ===============================
# Stage 1 — Build React frontend
# ===============================
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# ===============================
# Stage 2 — Build Spring Boot app
# ===============================
FROM openjdk:17-jdk-alpine AS backend-build
WORKDIR /app/backend
COPY backend/mvnw backend/mvnw.cmd backend/pom.xml ./
COPY backend/.mvn .mvn
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B
COPY backend/src src
RUN ./mvnw package -DskipTests

# ==========================================
# Final stage — Serve with Nginx + Backend
# ==========================================
FROM openjdk:17-jdk-alpine

# Install Nginx
RUN apk add --no-cache nginx

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy backend JAR
COPY --from=backend-build /app/backend/target/*.jar /app/backend.jar

# Write dynamic Nginx config using echo + envsubst support
RUN mkdir -p /etc/nginx/templates && \
    echo 'server {' > /etc/nginx/templates/default.conf.template && \
    echo '    listen ${PORT};' >> /etc/nginx/templates/default.conf.template && \
    echo '    server_name localhost;' >> /etc/nginx/templates/default.conf.template && \
    echo '' >> /etc/nginx/templates/default.conf.template && \
    echo '    location / {' >> /etc/nginx/templates/default.conf.template && \
    echo '        root /usr/share/nginx/html;' >> /etc/nginx/templates/default.conf.template && \
    echo '        index index.html;' >> /etc/nginx/templates/default.conf.template && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/templates/default.conf.template && \
    echo '        add_header Cache-Control "no-cache, no-store, must-revalidate";' >> /etc/nginx/templates/default.conf.template && \
    echo '    }' >> /etc/nginx/templates/default.conf.template && \
    echo '' >> /etc/nginx/templates/default.conf.template && \
    echo '    location /api/ {' >> /etc/nginx/templates/default.conf.template && \
    echo '        proxy_pass http://127.0.0.1:8080;' >> /etc/nginx/templates/default.conf.template && \
    echo '        proxy_set_header Host $host;' >> /etc/nginx/templates/default.conf.template && \
    echo '        proxy_set_header X-Real-IP $remote_addr;' >> /etc/nginx/templates/default.conf.template && \
    echo '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' >> /etc/nginx/templates/default.conf.template && \
    echo '        proxy_set_header X-Forwarded-Proto $scheme;' >> /etc/nginx/templates/default.conf.template && \
    echo '    }' >> /etc/nginx/templates/default.conf.template && \
    echo '}' >> /etc/nginx/templates/default.conf.template

# Entrypoint script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'echo "Starting Spring Boot backend..."' >> /start.sh && \
    echo 'java -jar /app/backend.jar --server.port=8080 & ' >> /start.sh && \
    echo 'echo "Waiting for backend to initialize..."' >> /start.sh && \
    echo 'sleep 10' >> /start.sh && \
    echo 'echo "Generating Nginx config..."' >> /start.sh && \
    echo 'envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'echo "Starting Nginx..."' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]
