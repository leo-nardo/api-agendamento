package com.farukgenc.boilerplate.springboot.repository;

import com.farukgenc.boilerplate.springboot.model.CompanyUser;
import com.farukgenc.boilerplate.springboot.model.CompanyUserId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyUserRepository extends JpaRepository<CompanyUser, CompanyUserId> {

    List<CompanyUser> findByUserId(UUID userId);

    Optional<CompanyUser> findByUserIdAndCompanyId(UUID userId, UUID companyId);
}
