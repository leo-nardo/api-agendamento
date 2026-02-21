package com.farukgenc.boilerplate.springboot.service;

import com.farukgenc.boilerplate.springboot.model.BusinessService;
import com.farukgenc.boilerplate.springboot.repository.BusinessServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BusinessServiceService {

    private final BusinessServiceRepository businessServiceRepository;

    public List<BusinessService> findAll() {
        return businessServiceRepository.findAll();
    }

    public List<BusinessService> findAllByCompanyId(UUID companyId) {
        return businessServiceRepository.findByCompanyId(companyId);
    }

    public BusinessService findById(UUID id) {
        return businessServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
    }

    public BusinessService create(BusinessService businessService) {
        return businessServiceRepository.save(businessService);
    }

    public void delete(UUID id) {
        businessServiceRepository.deleteById(id);
    }
}
