# Frontend build
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Backend build
FROM openjdk:17-jdk-alpine AS backend-build
WORKDIR /app/backend
COPY backend/mvnw backend/mvnw.cmd backend/pom.xml ./
COPY backend/.mvn .mvn
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B
COPY backend/src src
RUN ./mvnw package -DskipTests

# Final stage - run BOTH
FROM openjdk:17-jdk-alpine

# Install nginx
RUN apk add --no-cache nginx

# Copy built apps
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
COPY --from=backend-build /app/backend/target/*.jar /app/backend.jar

# Create nginx config for API proxy ← THIS IS CRUCIAL!
RUN mkdir -p /etc/nginx/conf.d && \
    echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '    location /api/ {' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_pass http://localhost:8080;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# Startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'nginx &' >> /start.sh && \
    echo 'java -jar /app/backend.jar' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 80
CMD ["/start.sh"]

