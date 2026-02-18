package com.farukgenc.boilerplate.springboot.security.service;

import com.farukgenc.boilerplate.springboot.model.UserAccount;
import com.farukgenc.boilerplate.springboot.security.dto.RegistrationRequest;
import com.farukgenc.boilerplate.springboot.security.dto.RegistrationResponse;

public interface UserService {

	UserAccount findByEmail(String email);

	RegistrationResponse registration(RegistrationRequest registrationRequest);

}
