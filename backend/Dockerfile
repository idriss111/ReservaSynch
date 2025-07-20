FROM openjdk:17-jdk-alpine AS development

WORKDIR /app

# Copy Maven & pom.xml
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

# Maven wrapper executble
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

#  Spring Boot port
EXPOSE 8080

# to start Spring Boot
CMD ["./mvnw", "spring-boot:run"]