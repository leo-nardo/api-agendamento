package com.farukgenc.boilerplate.springboot.repository;

import com.farukgenc.boilerplate.springboot.model.Professional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

import java.util.List;

public interface ProfessionalRepository extends JpaRepository<Professional, UUID> {
    List<Professional> findByCompanyId(UUID companyId);

    java.util.Optional<Professional> findByUserAccountIdAndCompanyId(UUID userAccountId, UUID companyId);

    @Modifying
    @Query("DELETE FROM Professional p WHERE p.companyId = :companyId")
    void deleteByCompanyId(@Param("companyId") UUID companyId);
}
