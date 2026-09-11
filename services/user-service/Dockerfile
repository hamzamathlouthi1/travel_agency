# ---------- Étape 1 : Build ----------
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# On copie d'abord le pom.xml pour profiter du cache Docker sur les dépendances
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Puis le code source
COPY src ./src
RUN mvn -B clean package -DskipTests

# ---------- Étape 2 : Runtime ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Utilisateur non-root pour la sécurité
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build /app/target/user-service.jar app.jar

EXPOSE 8081

ENV JAVA_OPTS=""

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
