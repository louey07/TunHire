# Authentication Module Analysis

The `auth` module is a core component of the Tunhire backend, responsible for user identity management, registration, and secure access control using JWT (JSON Web Tokens).

## 🏗 Architecture Overview

The module follows a layered architecture typical of Spring Boot applications, ensuring a clean separation of concerns:

- **Controller Layer (`auth.controller`)**: Exposes REST endpoints for authentication operations.
- **Service Layer (`auth.service`)**: Contains business logic for registration, login, and user retrieval.
- **Security Layer (`auth.security`)**: Handles JWT generation, parsing, and request filtering.
- **Persistence Layer (`auth.repository` & `auth.entity`)**: Manages `User` and `Role` data in the database.
- **DTO Layer (`auth.dto`)**: Defines the data structures for API requests and responses.

---

## 🔐 Key Components

### 1. Security Configuration (`SecurityConfig.java`)
Located in `common.config`, it wires the auth module into the Spring Security filter chain:
- Disables CSRF (stateless API).
- Sets session management to `STATELESS`.
- Configures public access for `/auth/register`, `/auth/login`, and GET requests to `/jobs`.
- Injects the `JwtAuthenticationFilter`.

### 2. JWT Management (`JwtUtil.java`)
The cryptographic engine of the module:
- **Generation**: Creates tokens containing the user's email (subject) and role.
- **Validation**: Verifies the signature against the `jwt.secret` and checks expiration.
- **Extraction**: Retrieves claims like email and roles for authorization decisions.

### 3. Authentication Filter (`JwtAuthenticationFilter.java`)
A per-request filter that:
1. Intercepts the `Authorization: Bearer <token>` header.
2. Validates the token using `JwtUtil`.
3. Loads the user from the database.
4. Populates the `SecurityContextHolder` with a `UsernamePasswordAuthenticationToken`, enabling RBAC (Role-Based Access Control) via `@PreAuthorize`.

---

## 🔄 Core Flows

### Registration Flow
1. **Request**: `POST /auth/register` with `RegisterRequest`.
2. **Validation**: Checks if the email is already registered in `UserRepository`.
3. **Hashing**: Passwords are encrypted using `BCryptPasswordEncoder`.
4. **Persistence**: A new `User` entity is saved with timestamps and assigned roles.
5. **Response**: Returns a JWT and a `UserDto`.

### Login Flow
1. **Request**: `POST /auth/login` with `LoginRequest`.
2. **Verification**: 
    - Fetches user by email.
    - Matches provided password against the hashed record.
    - *Security Note*: Uses unified error messages ("Invalid email or password") to prevent user enumeration.
3. **Token Issue**: Generates a new JWT valid for the duration specified in `jwt.expiration-ms`.

### Identity Resolution (`/auth/me`)
- Allows the frontend to fetch the current user's profile.
- Extracts the email from the authenticated context (populated by the filter) and returns the full `UserDto`.

---

## 🛠 Security Hardening Applied
- **Password Safety**: Uses BCrypt (one-way hashing).
- **Statelessness**: No server-side sessions; all state is in the JWT.
- **Input Validation**: Uses Jakarta Validation (`@Valid`) on all incoming requests.
- **RBAC**: Roles (`CANDIDATE`, `RECRUITER`, `ADMIN`) are embedded in tokens and enforced via Spring Security's `ROLE_` authority prefix.

## 📦 Dependencies
- `io.jsonwebtoken (jjwt)`: For JWT operations.
- `spring-boot-starter-security`: Core security framework.
- `spring-boot-starter-data-jpa`: User persistence.
