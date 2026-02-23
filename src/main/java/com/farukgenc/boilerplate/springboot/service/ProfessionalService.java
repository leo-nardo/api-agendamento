package com.farukgenc.boilerplate.springboot.service;

import com.farukgenc.boilerplate.springboot.model.Professional;
import com.farukgenc.boilerplate.springboot.repository.ProfessionalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import com.farukgenc.boilerplate.springboot.model.CompanyUser;
import com.farukgenc.boilerplate.springboot.model.UserAccount;
import com.farukgenc.boilerplate.springboot.model.Role;
import com.farukgenc.boilerplate.springboot.repository.CompanyUserRepository;
import com.farukgenc.boilerplate.springboot.repository.UserAccountRepository;
import com.farukgenc.boilerplate.springboot.repository.RoleRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfessionalService {

        private final ProfessionalRepository professionalRepository;
        private final UserAccountRepository userAccountRepository;
        private final CompanyUserRepository companyUserRepository;
        private final RoleRepository roleRepository;
        private final BCryptPasswordEncoder passwordEncoder;

        public List<Professional> findAll() {
                return professionalRepository.findAll();
        }

        public List<Professional> findAllByCompanyId(UUID companyId) {
                return professionalRepository.findByCompanyId(companyId);
        }

        public Professional findById(UUID id) {
                return professionalRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Professional not found"));
        }

        public Professional findByEmailAndCompanyId(String email, UUID companyId) {
                UserAccount user = userAccountRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return professionalRepository.findByUserAccountIdAndCompanyId(user.getId(), companyId)
                                .orElseThrow(() -> new RuntimeException("Professional not found"));
        }

        @Transactional
        public Professional create(com.farukgenc.boilerplate.springboot.security.dto.CreateProfessionalRequest request,
                        java.util.UUID companyId) {
                // 1. Create UserAccount
                UserAccount user = UserAccount.builder()
                                .email(request.getEmail())
                                .fullName(request.getFullName())
                                .phoneNumber(request.getPhoneNumber())
                                // In a real app, generate a random password and email it. Here we set a
                                // default.
                                .password(passwordEncoder.encode("mudar123"))
                                .active(true)
                                .build();
                user = userAccountRepository.save(user);

                // 2. Link User to Company
                CompanyUser companyUser = CompanyUser.builder()
                                .userId(user.getId())
                                .companyId(companyId)
                                .role(roleRepository.findByName("PROFESSIONAL")
                                                .orElseThrow(() -> new RuntimeException("Role PROFESSIONAL not found")))
                                .build();
                companyUserRepository.save(companyUser);

                // 3. Create Professional
                Professional professional = Professional.builder()
                                .userAccount(user)
                                .companyId(companyId)
                                .active(true)
                                .build();
                return professionalRepository.save(professional);
        }

        @Transactional
        public Professional updateWorkingHoursByEmail(String email, UUID companyId, String workingHours) {
                UserAccount user = userAccountRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                Professional professional = professionalRepository
                                .findByUserAccountIdAndCompanyId(user.getId(), companyId)
                                .orElseThrow(() -> new RuntimeException("Professional not found"));
                professional.setWorkingHours(workingHours);
                return professionalRepository.save(professional);
        }
}
