package com.farukgenc.boilerplate.springboot.audit;

import com.farukgenc.boilerplate.springboot.model.AuditLog;
import com.farukgenc.boilerplate.springboot.model.BaseTenantEntity;
import com.farukgenc.boilerplate.springboot.repository.AuditLogRepository;
import com.farukgenc.boilerplate.springboot.security.service.UserServiceImpl;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Component
public class AuditEntityListener {

    // We cannot use constructor injection easily in EntityListeners because they
    // are instantiated by JPA
    // We can use a static accessor or bean provider context, or @Autowired on field
    // (works in Spring managed listeners)

    private static AuditLogRepository auditLogRepository;

    @Autowired
    public void setAuditLogRepository(@Lazy AuditLogRepository repository) {
        AuditEntityListener.auditLogRepository = repository;
    }

    @PrePersist
    public void prePersist(Object target) {
        saveAudit(target, "CREATE");
    }

    @PreUpdate
    public void preUpdate(Object target) {
        saveAudit(target, "UPDATE");
    }

    @PreRemove
    public void preRemove(Object target) {
        saveAudit(target, "DELETE");
    }

    private void saveAudit(Object target, String action) {
        try {
            String entityName = target.getClass().getSimpleName();
            String entityId = "UNKNOWN";
            UUID companyId = null;

            if (target instanceof BaseTenantEntity) {
                // We might access ID via reflection or getter if strictly defined
                // For now, let's keep it generic or assume BaseEntity has ID
                companyId = ((BaseTenantEntity) target).getCompanyId();
                // Getting ID from BaseTenantEntity might require casting to specific types if
                // ID is not in Base
            }

            // Try to get ID via reflection or if it's a known type
            try {
                java.lang.reflect.Method getIdMethod = target.getClass().getMethod("getId");
                Object idObj = getIdMethod.invoke(target);
                if (idObj != null) {
                    entityId = idObj.toString();
                }
            } catch (Exception e) {
                // ignore
            }

            String principal = "ANONYMOUS";
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null) {
                principal = authentication.getName();
            }

            AuditLog auditLog = AuditLog.builder()
                    .entityName(entityName)
                    .entityId(entityId)
                    .action(action)
                    .principal(principal)
                    .timestamp(LocalDateTime.now())
                    .companyId(companyId)
                    .build();

            if (auditLogRepository != null) {
                auditLogRepository.save(auditLog);
            } else {
                log.warn("AuditLogRepository is null, cannot save audit log for {}", entityName);
            }

        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }
    }
}
