package com.farukgenc.boilerplate.springboot.repository;

import com.farukgenc.boilerplate.springboot.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

import java.util.Optional;
import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Optional<Customer> findByEmailAndCompanyId(String email, UUID companyId);

    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.userAccount WHERE c.companyId = :companyId")
    List<Customer> findByCompanyId(@Param("companyId") UUID companyId);

    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.userAccount WHERE c.id = :id")
    Optional<Customer> findById(@Param("id") UUID id);

    @Modifying
    @Query("DELETE FROM Customer c WHERE c.companyId = :companyId")
    void deleteByCompanyId(@Param("companyId") UUID companyId);
}
