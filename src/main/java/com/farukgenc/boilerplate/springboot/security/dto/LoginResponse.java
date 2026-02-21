package com.farukgenc.boilerplate.springboot.security.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {

	private String token;
	private java.util.UUID companyId;
	private String role;
	private String slug;
	private String companyName;
}
