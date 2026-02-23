package com.farukgenc.boilerplate.springboot.security.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminCompanyUpdateRequest {

    @NotEmpty(message = "{company_name_not_empty}")
    private String legalName;

    private String tradeName;

    private String slug;
}
