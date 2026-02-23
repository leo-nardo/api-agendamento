package com.farukgenc.boilerplate.springboot.security.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
public class AdminCompanyResponse {
    private UUID id;
    private String legalName;
    private String tradeName;
    private String slug;
    private String ownerEmail;
    private String ownerName;
    private boolean active;
    private LocalDateTime createdAt;
}
