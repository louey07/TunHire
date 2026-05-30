package com.tunhire.tunhire.notifications.repository;

import com.tunhire.tunhire.notifications.entity.RecruiterInboxState;
import com.tunhire.tunhire.notifications.entity.RecruiterInboxStateId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecruiterInboxStateRepository
    extends JpaRepository<RecruiterInboxState, RecruiterInboxStateId> {}
