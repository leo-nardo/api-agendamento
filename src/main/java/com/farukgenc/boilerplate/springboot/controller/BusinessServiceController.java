package com.farukgenc.boilerplate.springboot.controller;

import com.farukgenc.boilerplate.springboot.model.BusinessService;
import com.farukgenc.boilerplate.springboot.service.BusinessServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class BusinessServiceController {

    private final BusinessServiceService businessServiceService;

    @GetMapping
    public ResponseEntity<List<BusinessService>> getAllServices() {
        java.util.UUID companyId = com.farukgenc.boilerplate.springboot.security.TenantContext.getTenantId();
        return ResponseEntity.ok(businessServiceService.findAllByCompanyId(companyId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessService> getServiceById(@PathVariable UUID id) {
        return ResponseEntity.ok(businessServiceService.findById(id));
    }

    @PostMapping
    public ResponseEntity<BusinessService> createService(@RequestBody BusinessService businessService) {
        businessService.setCompanyId(com.farukgenc.boilerplate.springboot.security.TenantContext.getTenantId());
        return ResponseEntity.ok(businessServiceService.create(businessService));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable UUID id) {
        businessServiceService.delete(id);
        return ResponseEntity.ok().build();
    }
}
