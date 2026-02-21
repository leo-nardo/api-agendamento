package com.farukgenc.boilerplate.springboot.repository;

import com.farukgenc.boilerplate.springboot.model.Professional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

import java.util.List;

public interface ProfessionalRepository extends JpaRepository<Professional, UUID> {
    List<Professional> findByCompanyId(UUID companyId);
}
