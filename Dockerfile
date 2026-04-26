# Build Stage
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Set the working directory
WORKDIR /app

# Copy the entire repository (both frontend and backend) into the container
COPY . .

# Change to backend directory and build
# The -Pprod profile tells Maven to also build the frontend using frontend-maven-plugin
WORKDIR /app/backend
RUN mvn -Pprod -DskipTests clean package

# Run Stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/backend/target/*.jar app.jar

# Railway automatically sets the PORT environment variable, which Spring Boot picks up natively.
# But we expose 8080 as a fallback.
EXPOSE 8080

ENTRYPOINT ["java", "-Xmx512m", "-Dspring.profiles.active=prod", "-jar", "app.jar"]

