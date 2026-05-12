# Spring Modulith Migration Guide for Tunhire

This guide outlines the best practices and step-by-step instructions for integrating **Spring Modulith** into the `core-service` of the Tunhire project. Spring Modulith will help enforce the modular monolith architecture described in the project guidelines by providing structural validation and enabling event-driven communication between domains.

## Step 1: Add Dependencies

Add the Spring Modulith Bill of Materials (BOM) and dependencies to `core-service/pom.xml`.

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.modulith</groupId>
            <artifactId>spring-modulith-bom</artifactId>
            <version>1.1.x</version> <!-- Use the version compatible with Spring Boot 3.x/4.x -->
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <!-- Core Spring Modulith features -->
    <dependency>
        <groupId>org.springframework.modulith</groupId>
        <artifactId>spring-modulith-starter-core</artifactId>
    </dependency>
    
    <!-- For architecture verification in tests -->
    <dependency>
        <groupId>org.springframework.modulith</groupId>
        <artifactId>spring-modulith-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## Step 2: Formulate Module Boundaries

Spring Modulith relies on Java package structures to define module boundaries. By default, any package directly under the main application class (e.g., `com.tunhire.jobs`, `com.tunhire.companies`) is considered a structural module.

To strictly enforce encapsulation, you should divide each module into **API** and **Internal** layers:

### The `API` Layer (Public to other modules)
Place classes that *other modules* are allowed to use directly in the module's root package.
- `com.tunhire.jobs.JobService` (Interface)
- `com.tunhire.jobs.JobSummaryDto` (DTO)
- `com.tunhire.jobs.JobCreatedEvent` (Event)

### The `Internal` Layer (Hidden from other modules)
Move implementation details to sub-packages or mark them as package-private. Spring Modulith restricts cross-module access to sub-packages.
- `com.tunhire.jobs.internal.entity.Job`
- `com.tunhire.jobs.internal.repository.JobRepository`
- `com.tunhire.jobs.internal.service.JobServiceImpl`

*Note: Alternatively, you can use package-private visibility within a single package, but moving to an `internal` sub-package makes boundaries visually explicit.*

## Step 3: Create the Modulith Verification Test

You need to verify the module structure using tests (fulfilling your `TASK-006`).

Create a test class in `src/test/java/com/tunhire/ArchitectureTest.java`:

```java
package com.tunhire;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;
import org.springframework.modulith.test.ApplicationModuleTest;

class ArchitectureTest {

    ApplicationModules modules = ApplicationModules.of(TunhireApplication.class);

    @Test
    void verifyModularStructure() {
        // This fails the test if any module violates architectural rules 
        // e.g., accessing an internal class of another module
        modules.verify();
    }
    
    @Test
    void createModuleDocumentation() {
        // Automatically generates C4 Architecture diagrams based on your code!
        new Documenter(modules)
            .writeModulesAsPlantUml()
            .writeIndividualModulesAsPlantUml();
    }
}
```

## Step 4: Refactor Cross-Domain Calls to Use Events

Current guidelines state: *"Keep cross-domain calls via services only."* While better than hitting repositories, synchronous service calls still couple modules temporally.

With Spring Modulith, refactor these flows to be asynchronous and event-driven.

### Before (Synchronous - Tightly Coupled)
```java
// In Auth Module
@Service
public class AuthServiceImpl {
    private final CandidateService candidateService;

    public User registerCandidate(RegisterDto dto) {
        User user = saveUser(dto);
        // Auth module "knows" about Candidate profile creation
        candidateService.createProfile(user.getId()); 
        return user;
    }
}
```

### After (Event-Driven - Loosely Coupled)

**1. Publish an Event (Auth Module)**
```java
// In Auth Module
@Service
public class AuthServiceImpl {
    private final ApplicationEventPublisher events;

    public User registerCandidate(RegisterDto dto) {
        User user = saveUser(dto);
        events.publishEvent(new CandidateRegisteredEvent(user.getId()));
        return user;
    }
}
```

**2. Listen Internally (Candidate Module)**
```java
// In Candidate Module
@Service
public class CandidateService {
    
    @ApplicationModuleListener // Spring Modulith annotation for async, transactional listeners
    void onCandidateRegistered(CandidateRegisteredEvent event) {
        createProfile(event.userId());
    }
}
```

## Step 5: Leverage Advanced Features (Optional but Recommended)

1. **Transactional Outbox Pattern**: Use `@ApplicationModuleListener` out of the box with Spring Modulith to ensure events are reliably published and processed, even if the app crashes, by saving events to a database outbox table.
2. **Integration Testing per Module**: Use `@ApplicationModuleTest` on your integration tests to load *only* the specific module being tested, drastically speeding up test execution compared to `@SpringBootTest`.

## Migration Checklist
- [ ] Add dependencies to `pom.xml`.
- [ ] Ensure all domain packages match the top-level structure (e.g., `com.tunhire.<module>`).
- [ ] Create the `ArchitectureTest.java` to catch immediate cyclic dependencies.
- [ ] Iterate through failing architecture tests to fix cross-domain repository fetching.
- [ ] Hide implementation details into `.internal` packages.
- [ ] Identify high-coupling points and introduce Spring Events (`@ApplicationModuleListener`).
