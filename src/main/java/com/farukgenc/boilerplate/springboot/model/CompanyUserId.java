package com.farukgenc.boilerplate.springboot.model;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class CompanyUserId implements Serializable {
    private java.util.UUID userId;
    private java.util.UUID companyId;
}
