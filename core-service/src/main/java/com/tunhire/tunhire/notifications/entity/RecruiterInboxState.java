package com.tunhire.tunhire.notifications.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
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
@Table(name = "recruiter_inbox_state")
public class RecruiterInboxState {

    @EmbeddedId
    private RecruiterInboxStateId id;

    @Column(name = "applications_seen_at", nullable = false)
    private Instant applicationsSeenAt;
}
