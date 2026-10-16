# Render runs Java via Docker (no native Java runtime).
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/hms-*.jar app.jar
# Render injects $PORT; application.yml reads server.port from it (default 8080).
ENTRYPOINT ["java", "-jar", "app.jar"]
