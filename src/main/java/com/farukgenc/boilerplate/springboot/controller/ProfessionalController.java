package com.farukgenc.boilerplate.springboot.controller;

import com.farukgenc.boilerplate.springboot.model.Professional;
import com.farukgenc.boilerplate.springboot.payload.response.ProfessionalResponse;
import com.farukgenc.boilerplate.springboot.service.ProfessionalService;
import com.farukgenc.boilerplate.springboot.utils.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/professionals")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('MANAGE_PROFESSIONALS', 'VIEW_PROFESSIONALS')")
public class ProfessionalController {

    private final ProfessionalService professionalService;
    private final DtoMapper dtoMapper;

    @GetMapping
    public ResponseEntity<List<ProfessionalResponse>> getAllProfessionals() {
        java.util.UUID companyId = com.farukgenc.boilerplate.springboot.security.TenantContext.getTenantId();
        List<ProfessionalResponse> responses = professionalService.findAllByCompanyId(companyId)
                .stream()
                .map(dtoMapper::toProfessionalResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfessionalResponse> getProfessionalById(@PathVariable UUID id) {
        return ResponseEntity.ok(dtoMapper.toProfessionalResponse(professionalService.findById(id)));
    }

    @GetMapping("/me")
    public ResponseEntity<ProfessionalResponse> getMyProfile(java.security.Principal principal) {
        java.util.UUID companyId = com.farukgenc.boilerplate.springboot.security.TenantContext.getTenantId();
        String email = principal.getName();
        Professional professional = professionalService.findByEmailAndCompanyId(email, companyId);
        return ResponseEntity.ok(dtoMapper.toProfessionalResponse(professional));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_PROFESSIONALS')")
    public ResponseEntity<ProfessionalResponse> createProfessional(
            @RequestBody com.farukgenc.boilerplate.springboot.security.dto.CreateProfessionalRequest request) {
        java.util.UUID companyId = com.farukgenc.boilerplate.springboot.security.TenantContext.getTenantId();
        Professional created = professionalService.create(request, companyId);
        return ResponseEntity.ok(dtoMapper.toProfessionalResponse(created));
    }

    @PutMapping("/me/working-hours")
    public ResponseEntity<ProfessionalResponse> updateMyWorkingHours(
            @RequestBody com.fasterxml.jackson.databind.JsonNode workingHoursNode,
            java.security.Principal principal) {
        java.util.UUID companyId = com.farukgenc.boilerplate.springboot.security.TenantContext.getTenantId();
        String jsonString = workingHoursNode.toString();
        Professional updated = professionalService.updateWorkingHoursByEmail(principal.getName(), companyId,
                jsonString);
        return ResponseEntity.ok(dtoMapper.toProfessionalResponse(updated));
    }
}
