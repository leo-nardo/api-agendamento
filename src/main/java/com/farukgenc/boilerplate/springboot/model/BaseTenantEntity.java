package com.farukgenc.boilerplate.springboot.model;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@MappedSuperclass
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FilterDef(name = "tenantFilter", parameters = { @ParamDef(name = "companyId", type = String.class) })
@Filter(name = "tenantFilter", condition = "company_id = cast(:companyId as uuid)")
public abstract class BaseTenantEntity implements Serializable {

    @NotNull
    @Column(name = "company_id", nullable = false)
    private java.util.UUID companyId;

    @Builder.Default
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(); // handled by DB default usually, but good to have fallback

    @Builder.Default
    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // We can add PrePersist/PreUpdate listeners here if we want to handle
    // timestamps in Java
}
