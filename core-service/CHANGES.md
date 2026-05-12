# core-service Changes

## New Files

### `src/main/java/com/tunhire/tunhire/common/AiServiceClient.java`
HTTP client that calls the AI service. Handles CV parsing (`POST /v1/cv/parse`),
candidate-job matching (`POST /v1/match`), and candidate ranking (`POST /v1/rank`).
Returns `null` and logs a warning when the AI service is unavailable.

### `src/main/java/com/tunhire/tunhire/common/config/AppConfig.java`
Defines the `RestTemplate` bean used by `AiServiceClient`.

### `src/main/java/com/tunhire/tunhire/common/CandidateSkillsDto.java`
DTO carrying a candidate ID and their skill list, used as input to the ranking endpoint.

---

## Modified Files

### `src/main/java/com/tunhire/tunhire/candidate/controller/CandidateController.java`
Added `POST /candidates/me/cv/parse` endpoint. Accepts a multipart CV file, calls
`AiServiceClient.parseCv()`, and on a successful result updates both the candidate's
skills (`updateSkillsFromCv`) and their profile fields — location and years of
experience (`updateProfile`).

### `src/main/java/com/tunhire/tunhire/candidate/CandidateService.java`
Added `updateSkillsFromCv(Long userId, List<String> skills)` to the interface.

### `src/main/java/com/tunhire/tunhire/candidate/service/CandidateServiceImpl.java`
- Implemented `updateSkillsFromCv`: clears existing skills for the profile and inserts
  the ones returned by the AI service.
- Changed `updateProfile` to patch semantics: only non-null fields in
  `UpdateProfileRequest` are written to the entity, so callers can update a subset of
  fields without wiping the rest.

### `src/main/java/com/tunhire/tunhire/candidate/repository/CandidateSkillRepository.java`
Added `deleteAllByProfileId(Long profileId)` used by `updateSkillsFromCv` to replace
the skill set atomically.

### `src/main/java/com/tunhire/tunhire/TunhireApplication.java`
Excluded `UserDetailsServiceAutoConfiguration` from Spring Boot auto-configuration to
suppress the "Using generated security password" log and prevent an unused
`InMemoryUserDetailsManager` bean from being created alongside the JWT setup.

### `src/main/java/com/tunhire/tunhire/auth/config/SecurityConfig.java`
Added a `FilterRegistrationBean` that disables the automatic servlet-container
registration of `JwtAuthenticationFilter`. Because the filter is a `@Component`, Spring
Boot was registering it twice — once outside and once inside the security filter chain.
The bean ensures it runs only where it is explicitly placed (inside the chain via
`addFilterBefore`).

### `src/main/resources/application.properties`
Added `ai.service.url=http://localhost:8000` (overridable via the `AI_SERVICE_URL`
environment variable) to configure the base URL for `AiServiceClient`.
