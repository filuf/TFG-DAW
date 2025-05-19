FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY ./orders/pom.xml .
COPY ./orders/src ./src
RUN mvn clean package -DskipTests


FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
