package com.farukgenc.boilerplate.springboot.controller;

import com.farukgenc.boilerplate.springboot.model.BusinessService;
import com.farukgenc.boilerplate.springboot.payload.response.BusinessServiceResponse;
import com.farukgenc.boilerplate.springboot.service.BusinessServiceService;
import com.farukgenc.boilerplate.springboot.utils.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('MANAGE_SERVICES', 'VIEW_SERVICES')")
public class BusinessServiceController {

    private final BusinessServiceService businessServiceService;
    private final DtoMapper dtoMapper;

    @GetMapping
    public ResponseEntity<List<BusinessServiceResponse>> getAllServices() {
        java.util.UUID companyId = com.farukgenc.boilerplate.springboot.security.TenantContext.getTenantId();
        List<BusinessServiceResponse> responses = businessServiceService.findAllByCompanyId(companyId)
                .stream()
                .map(dtoMapper::toBusinessServiceResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessServiceResponse> getServiceById(@PathVariable UUID id) {
        return ResponseEntity.ok(dtoMapper.toBusinessServiceResponse(businessServiceService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_SERVICES')")
    public ResponseEntity<BusinessServiceResponse> createService(@RequestBody BusinessService businessService) {
        businessService.setCompanyId(com.farukgenc.boilerplate.springboot.security.TenantContext.getTenantId());
        return ResponseEntity.ok(dtoMapper.toBusinessServiceResponse(businessServiceService.create(businessService)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_SERVICES')")
    public ResponseEntity<Void> deleteService(@PathVariable UUID id) {
        businessServiceService.delete(id);
        return ResponseEntity.ok().build();
    }
}
