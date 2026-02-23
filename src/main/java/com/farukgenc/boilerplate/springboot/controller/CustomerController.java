package com.farukgenc.boilerplate.springboot.controller;

import com.farukgenc.boilerplate.springboot.payload.response.CustomerResponse;
import com.farukgenc.boilerplate.springboot.service.CustomerService;
import com.farukgenc.boilerplate.springboot.utils.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('MANAGE_CUSTOMERS', 'VIEW_CUSTOMERS')")
public class CustomerController {

    private final CustomerService customerService;
    private final DtoMapper dtoMapper;

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
        java.util.UUID companyId = com.farukgenc.boilerplate.springboot.security.TenantContext.getTenantId();
        List<CustomerResponse> responses = customerService.findAllByCompanyId(companyId)
                .stream()
                .map(dtoMapper::toCustomerResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable UUID id) {
        return ResponseEntity.ok(dtoMapper.toCustomerResponse(customerService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_CUSTOMERS')")
    public ResponseEntity<CustomerResponse> createCustomer(
            @RequestBody com.farukgenc.boilerplate.springboot.security.dto.CreateCustomerRequest request) {
        java.util.UUID companyId = com.farukgenc.boilerplate.springboot.security.TenantContext.getTenantId();
        return ResponseEntity.ok(dtoMapper.toCustomerResponse(customerService.createFromRequest(request, companyId)));
    }
}
