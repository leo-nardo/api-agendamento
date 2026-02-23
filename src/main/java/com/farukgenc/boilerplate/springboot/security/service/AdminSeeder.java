package com.farukgenc.boilerplate.springboot.security.service;

import com.farukgenc.boilerplate.springboot.model.UserAccount;
import com.farukgenc.boilerplate.springboot.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.farukgenc.boilerplate.springboot.model.Role;
import com.farukgenc.boilerplate.springboot.model.Permission;
import com.farukgenc.boilerplate.springboot.repository.RoleRepository;
import com.farukgenc.boilerplate.springboot.repository.PermissionRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.Set;
import java.util.HashSet;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserAccountRepository userAccountRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:admin@agendamento.com}")
    private String adminEmail;

    @Value("${admin.password:admin}")
    private String adminPassword;

    @Value("${admin.name:SaaS Admin}")
    private String adminName;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Checking and initializing RBAC System...");
        seedPermissionsAndRoles();

        log.info("Checking for Platform Admin user...");

        Optional<UserAccount> existingAdmin = userAccountRepository.findByEmail(adminEmail);

        if (existingAdmin.isEmpty()) {
            log.info("Platform Admin not found. Creating default admin with email: {}", adminEmail);

            UserAccount adminUser = UserAccount.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .fullName(adminName)
                    .isAdmin(true)
                    .active(true)
                    .build();

            userAccountRepository.save(adminUser);
            log.info("Platform Admin created successfully.");
        } else {
            log.info("Platform Admin already exists.");
            // Optionally, we could ensure that the existing user has isAdmin=true
            UserAccount admin = existingAdmin.get();
            if (!admin.isAdmin()) {
                admin.setAdmin(true);
                userAccountRepository.save(admin);
                log.info("Updated existing superuser to have isAdmin=true");
            }
        }
    }

    private void seedPermissionsAndRoles() {
        log.info("Seeding DB Permissions...");
        // 1. Create Permissions
        List<String> permissionNames = Arrays.asList(
                "MANAGE_COMPANIES", "VIEW_GLOBAL_REPORTS",
                "MANAGE_SERVICES", "MANAGE_PROFESSIONALS", "MANAGE_CUSTOMERS", "MANAGE_ALL_APPOINTMENTS",
                "MANAGE_COMPANY_SETTINGS",
                "VIEW_SERVICES", "VIEW_PROFESSIONALS", "VIEW_CUSTOMERS",
                "VIEW_OWN_APPOINTMENTS", "MANAGE_OWN_SCHEDULE", "CREATE_APPOINTMENT",
                "VIEW_ALL_APPOINTMENTS");

        for (String permName : permissionNames) {
            permissionRepository.findByName(permName).orElseGet(() -> {
                Permission p = Permission.builder().name(permName).description(permName + " permission").build();
                return permissionRepository.save(p);
            });
        }

        log.info("Seeding DB Roles...");
        // 2. Create Roles mapping
        createRole("ADMIN", Arrays.asList("MANAGE_COMPANIES", "VIEW_GLOBAL_REPORTS"));

        createRole("OWNER", Arrays.asList(
                "MANAGE_SERVICES", "MANAGE_PROFESSIONALS", "MANAGE_CUSTOMERS",
                "MANAGE_ALL_APPOINTMENTS", "MANAGE_COMPANY_SETTINGS",
                "VIEW_SERVICES", "VIEW_PROFESSIONALS", "VIEW_CUSTOMERS"));

        createRole("PROFESSIONAL", Arrays.asList(
                "VIEW_OWN_APPOINTMENTS", "MANAGE_OWN_SCHEDULE", "CREATE_APPOINTMENT",
                "VIEW_SERVICES", "VIEW_PROFESSIONALS", "VIEW_CUSTOMERS"));

        createRole("RECEPTIONIST", Arrays.asList(
                "VIEW_ALL_APPOINTMENTS", "CREATE_APPOINTMENT", "MANAGE_CUSTOMERS",
                "VIEW_SERVICES", "VIEW_PROFESSIONALS", "VIEW_CUSTOMERS"));
    }

    private void createRole(String roleName, List<String> permNames) {
        Role role = roleRepository.findByName(roleName).orElse(
                Role.builder().name(roleName).description(roleName + " role").permissions(new HashSet<>()).build());

        Set<Permission> perms = new HashSet<>();
        for (String permName : permNames) {
            permissionRepository.findByName(permName).ifPresent(perms::add);
        }

        role.setPermissions(perms);
        roleRepository.save(role);
    }
}
