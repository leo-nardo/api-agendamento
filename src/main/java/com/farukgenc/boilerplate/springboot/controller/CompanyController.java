package com.farukgenc.boilerplate.springboot.controller;

import com.farukgenc.boilerplate.springboot.payload.response.CompanyResponse;
import com.farukgenc.boilerplate.springboot.repository.CompanyRepository;
import com.farukgenc.boilerplate.springboot.security.TenantContext;
import com.farukgenc.boilerplate.springboot.utils.DtoMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/owner/company")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyRepository companyRepository;
    private final DtoMapper dtoMapper;

    @GetMapping
    @PreAuthorize("hasAuthority('MANAGE_COMPANY_SETTINGS')")
    public ResponseEntity<CompanyResponse> getMyCompany() {
        UUID companyId = TenantContext.getTenantId();
        return companyRepository.findById(companyId)
                .map(company -> ResponseEntity.ok(dtoMapper.toCompanyResponse(company)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    @PreAuthorize("hasAuthority('MANAGE_COMPANY_SETTINGS')")
    public ResponseEntity<CompanyResponse> updateMyCompany(@RequestBody UpdateCompanyRequest request) {
        UUID companyId = TenantContext.getTenantId();
        return companyRepository.findById(companyId).map(company -> {
            if (request.getTradeName() != null)
                company.setTradeName(request.getTradeName());
            if (request.getLegalName() != null)
                company.setLegalName(request.getLegalName());
            if (request.getSlug() != null)
                company.setSlug(request.getSlug());
            if (request.getTaxId() != null)
                company.setTaxId(request.getTaxId());
            if (request.getSettingsJson() != null)
                company.setSettingsJson(request.getSettingsJson());

            companyRepository.save(company);
            return ResponseEntity.ok(dtoMapper.toCompanyResponse(company));
        }).orElse(ResponseEntity.notFound().build());
    }
}

@Data
class UpdateCompanyRequest {
    private String tradeName;
    private String legalName;
    private String slug;
    private String taxId;
    private String settingsJson;
}
