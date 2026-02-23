package com.farukgenc.boilerplate.springboot.controller;

import com.farukgenc.boilerplate.springboot.model.Company;
import com.farukgenc.boilerplate.springboot.security.dto.AdminCompanyResponse;
import com.farukgenc.boilerplate.springboot.repository.CompanyRepository;
import com.farukgenc.boilerplate.springboot.repository.CompanyUserRepository;
import com.farukgenc.boilerplate.springboot.model.CompanyUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.Valid;

import java.util.List;
import java.util.stream.Collectors;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin/companies")
@RequiredArgsConstructor
public class PlatformAdminController {

    private final CompanyRepository companyRepository;
    private final CompanyUserRepository companyUserRepository;
    private final com.farukgenc.boilerplate.springboot.repository.AppointmentRepository appointmentRepository;
    private final com.farukgenc.boilerplate.springboot.repository.CustomerRepository customerRepository;
    private final com.farukgenc.boilerplate.springboot.repository.ProfessionalRepository professionalRepository;
    private final com.farukgenc.boilerplate.springboot.repository.BusinessServiceRepository businessServiceRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('MANAGE_COMPANIES')")
    public ResponseEntity<List<AdminCompanyResponse>> getAllCompanies() {
        List<Company> companies = companyRepository.findAll();

        List<AdminCompanyResponse> responses = companies.stream().map(company -> {

            String ownerEmail = null;
            String ownerName = null;

            // Try to find the OWNER for this company
            List<CompanyUser> users = companyUserRepository.findByCompanyId(company.getId());
            Optional<CompanyUser> owner = users.stream()
                    .filter(cu -> "OWNER".equals(cu.getRole().getName()))
                    .findFirst();

            if (owner.isPresent() && owner.get().getUserAccount() != null) {
                ownerEmail = owner.get().getUserAccount().getEmail();
                ownerName = owner.get().getUserAccount().getFullName();
            }

            return AdminCompanyResponse.builder()
                    .id(company.getId())
                    .legalName(company.getLegalName())
                    .tradeName(company.getTradeName())
                    .slug(company.getSlug())
                    .active(company.isActive())
                    .createdAt(company.getCreatedAt())
                    .ownerEmail(ownerEmail)
                    .ownerName(ownerName)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{companyId}/toggle-status")
    @PreAuthorize("hasAuthority('MANAGE_COMPANIES')")
    public ResponseEntity<Void> toggleCompanyStatus(@PathVariable java.util.UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        company.setActive(!company.isActive());
        companyRepository.save(company);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{companyId}")
    @PreAuthorize("hasAuthority('MANAGE_COMPANIES')")
    public ResponseEntity<AdminCompanyResponse> updateCompany(
            @PathVariable java.util.UUID companyId,
            @Valid @RequestBody com.farukgenc.boilerplate.springboot.security.dto.AdminCompanyUpdateRequest request) {

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        company.setLegalName(request.getLegalName());
        if (request.getTradeName() != null)
            company.setTradeName(request.getTradeName());
        if (request.getSlug() != null)
            company.setSlug(request.getSlug());

        Company updated = companyRepository.save(company);

        return ResponseEntity.ok(AdminCompanyResponse.builder()
                .id(updated.getId())
                .legalName(updated.getLegalName())
                .tradeName(updated.getTradeName())
                .slug(updated.getSlug())
                .active(updated.isActive())
                .createdAt(updated.getCreatedAt())
                .build());
    }

    @DeleteMapping("/{companyId}")
    @PreAuthorize("hasAuthority('MANAGE_COMPANIES')")
    @Transactional
    public ResponseEntity<Void> deleteCompany(@PathVariable java.util.UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Manually cascade deletes to avoid foreign key constraints
        appointmentRepository.deleteByCompanyId(companyId);
        customerRepository.deleteByCompanyId(companyId);
        professionalRepository.deleteByCompanyId(companyId);
        businessServiceRepository.deleteByCompanyId(companyId);
        companyUserRepository.deleteByCompanyId(companyId);

        // Finally, delete the company itself
        companyRepository.delete(company);

        return ResponseEntity.noContent().build();
    }
}
