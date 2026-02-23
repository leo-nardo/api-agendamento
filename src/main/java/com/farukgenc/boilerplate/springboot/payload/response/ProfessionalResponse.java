package com.farukgenc.boilerplate.springboot.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfessionalResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private boolean active;
    private Object workingHours; // We can parse it as object or string based on Jackson
}
