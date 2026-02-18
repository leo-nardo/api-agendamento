package com.farukgenc.boilerplate.springboot.service;

import com.farukgenc.boilerplate.springboot.model.Professional;
import com.farukgenc.boilerplate.springboot.repository.ProfessionalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfessionalService {

    private final ProfessionalRepository professionalRepository;

    public List<Professional> findAll() {
        return professionalRepository.findAll();
    }

    public Professional findById(UUID id) {
        return professionalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Professional not found"));
    }

    public Professional create(Professional professional) {
        // Note: Creation usually happens via User Registration, but this can be for
        // adding new staff
        return professionalRepository.save(professional);
    }
}
