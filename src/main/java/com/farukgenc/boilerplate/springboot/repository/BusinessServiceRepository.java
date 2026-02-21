package com.farukgenc.boilerplate.springboot.repository;

import com.farukgenc.boilerplate.springboot.model.BusinessService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import java.util.List;

@Repository
public interface BusinessServiceRepository extends JpaRepository<BusinessService, UUID> {
    List<BusinessService> findByCompanyId(UUID companyId);
}
