package com.farukgenc.boilerplate.springboot.security.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateProfessionalRequest {

    @NotEmpty(message = "{full_name_not_empty}")
    private String fullName;

    @Email
    @NotEmpty(message = "{email_not_empty}")
    private String email;

    @NotEmpty(message = "{phone_number_not_empty}")
    private String phoneNumber;
}
