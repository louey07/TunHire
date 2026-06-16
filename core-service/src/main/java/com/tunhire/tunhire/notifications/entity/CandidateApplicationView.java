package com.tunhire.tunhire.notifications.entity;

import com.tunhire.tunhire.applications.entity.ApplicationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "candidate_application_views")
public class CandidateApplicationView {

    @EmbeddedId
    private CandidateApplicationViewId id;

    @Enumerated(EnumType.STRING)
    @Column(name = "last_seen_status", nullable = false, length = 32)
    private ApplicationStatus lastSeenStatus;

    @Column(name = "last_seen_at", nullable = false)
    private Instant lastSeenAt;
}
