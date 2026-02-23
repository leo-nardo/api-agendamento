package com.farukgenc.boilerplate.springboot.repository;

import com.farukgenc.boilerplate.springboot.model.BusinessService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

import java.util.List;

@Repository
public interface BusinessServiceRepository extends JpaRepository<BusinessService, UUID> {
    List<BusinessService> findByCompanyId(UUID companyId);

    @Modifying
    @Query("DELETE FROM BusinessService bs WHERE bs.companyId = :companyId")
    void deleteByCompanyId(@Param("companyId") UUID companyId);
}
