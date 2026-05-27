# Project Guidelines

## Architecture
- Spring Boot app in core-service with domain packages under src/main/java/com/example/tunhire (auth, jobs, companies, applications, common).
- Keep cross-domain calls via services only; avoid direct repository or entity access across domains.
- common/ is for shared config, exceptions, and generic DTOs only.

## Build and Test
- Build (from core-service): `./mvnw clean install`
- Run locally (from core-service): `./mvnw spring-boot:run`
- Docker: `docker compose up --build` using core-service/compose.yaml
- Tests use H2 test profile (see src/test/resources/application-test.properties).

## Conventions
- Java 21, Spring Boot 4.x (see core-service/pom.xml).
- Compose uses host ports 8081 (app) and 5433 (Postgres) in core-service/compose.yaml.
- Docker build skips tests (core-service/Dockerfile).

## References
- Spring Boot helper notes in core-service/HELP.md
