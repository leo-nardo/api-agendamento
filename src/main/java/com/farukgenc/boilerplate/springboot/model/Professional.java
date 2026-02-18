package com.farukgenc.boilerplate.springboot.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "professional")
@EntityListeners(com.farukgenc.boilerplate.springboot.audit.AuditEntityListener.class)
public class Professional extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private java.util.UUID id;

    @OneToOne
    @JoinColumn(name = "user_account_id", nullable = false)
    private UserAccount userAccount;

    @Builder.Default
    private boolean active = true;
}
