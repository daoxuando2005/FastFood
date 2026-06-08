FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY target/auth_service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8090 
# Expose 8090 cho khớp với application.yml
ENTRYPOINT ["java", "-jar", "app.jar"]