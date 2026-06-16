package com.tunhire.tunhire.notifications.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class RecruiterInboxStateId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "company_id")
    private Long companyId;
}
