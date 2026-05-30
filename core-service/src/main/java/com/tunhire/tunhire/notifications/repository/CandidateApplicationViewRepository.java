package com.tunhire.tunhire.notifications.repository;

import com.tunhire.tunhire.notifications.entity.CandidateApplicationView;
import com.tunhire.tunhire.notifications.entity.CandidateApplicationViewId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateApplicationViewRepository
    extends JpaRepository<CandidateApplicationView, CandidateApplicationViewId> {

    List<CandidateApplicationView> findByIdUserId(Long userId);
}
