package com.farukgenc.boilerplate.springboot.security.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class RegistrationRequest {

	@NotEmpty(message = "{company_name_not_empty}")
	private String companyName;

	@NotEmpty(message = "{tax_id_not_empty}")
	private String taxId;

	@NotEmpty(message = "{full_name_not_empty}")
	private String fullName;

	@Email
	@NotEmpty(message = "{email_not_empty}")
	private String email;

	@NotEmpty(message = "{password_not_empty}")
	private String password;

}
