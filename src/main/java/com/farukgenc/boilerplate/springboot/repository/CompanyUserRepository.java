package com.farukgenc.boilerplate.springboot.repository;

import com.farukgenc.boilerplate.springboot.model.CompanyUser;
import com.farukgenc.boilerplate.springboot.model.CompanyUserId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyUserRepository extends JpaRepository<CompanyUser, CompanyUserId> {

    List<CompanyUser> findByUserId(UUID userId);

    Optional<CompanyUser> findByUserIdAndCompanyId(UUID userId, UUID companyId);

    List<CompanyUser> findByCompanyId(UUID companyId);

    @Modifying
    @Query("DELETE FROM CompanyUser c WHERE c.companyId = :companyId")
    void deleteByCompanyId(@Param("companyId") UUID companyId);
}
