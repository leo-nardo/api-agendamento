package com.farukgenc.boilerplate.springboot.security;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class TenantContext {

    private static final ThreadLocal<java.util.UUID> currentTenant = new ThreadLocal<>();

    public static void setTenantId(java.util.UUID tenantId) {
        log.debug("Setting tenantId to {}", tenantId);
        currentTenant.set(tenantId);
    }

    public static java.util.UUID getTenantId() {
        return currentTenant.get();
    }

    public static void clear() {
        log.debug("Clearing tenantId");
        currentTenant.remove();
    }
}
