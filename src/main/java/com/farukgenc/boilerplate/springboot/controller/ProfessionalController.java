package com.farukgenc.boilerplate.springboot.controller;

import com.farukgenc.boilerplate.springboot.model.Professional;
import com.farukgenc.boilerplate.springboot.service.ProfessionalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/professionals")
@RequiredArgsConstructor
public class ProfessionalController {

    private final ProfessionalService professionalService;

    @GetMapping
    public ResponseEntity<List<Professional>> getAllProfessionals() {
        java.util.UUID companyId = com.farukgenc.boilerplate.springboot.security.TenantContext.getTenantId();
        return ResponseEntity.ok(professionalService.findAllByCompanyId(companyId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Professional> getProfessionalById(@PathVariable UUID id) {
        return ResponseEntity.ok(professionalService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Professional> createProfessional(
            @RequestBody com.farukgenc.boilerplate.springboot.security.dto.CreateProfessionalRequest request) {
        java.util.UUID companyId = com.farukgenc.boilerplate.springboot.security.TenantContext.getTenantId();
        Professional created = professionalService.create(request, companyId);
        return ResponseEntity.ok(created);
    }
}
