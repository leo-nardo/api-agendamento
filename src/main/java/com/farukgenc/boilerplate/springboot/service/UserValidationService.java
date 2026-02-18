package com.farukgenc.boilerplate.springboot.service;

import com.farukgenc.boilerplate.springboot.utils.ExceptionMessageAccessor;
import com.farukgenc.boilerplate.springboot.exceptions.RegistrationException;
import com.farukgenc.boilerplate.springboot.repository.UserAccountRepository;
import com.farukgenc.boilerplate.springboot.repository.CompanyRepository;
import com.farukgenc.boilerplate.springboot.security.dto.RegistrationRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserValidationService {

	private static final String EMAIL_ALREADY_EXISTS = "email_already_exists";
	private static final String TAX_ID_ALREADY_EXISTS = "tax_id_already_exists";

	private final UserAccountRepository userAccountRepository;
	private final CompanyRepository companyRepository;

	private final ExceptionMessageAccessor exceptionMessageAccessor;

	public void validateUser(RegistrationRequest registrationRequest) {

		final String email = registrationRequest.getEmail();
		final String taxId = registrationRequest.getTaxId();

		checkEmail(email);
		checkTaxId(taxId);
	}

	private void checkEmail(String email) {

		final boolean existsByEmail = userAccountRepository.existsByEmail(email);

		if (existsByEmail) {
			final String existsEmail = exceptionMessageAccessor.getMessage(null, EMAIL_ALREADY_EXISTS);
			throw new RegistrationException(existsEmail);
		}
	}

	private void checkTaxId(String taxId) {
		if (companyRepository.existsByTaxId(taxId)) {
			final String msg = exceptionMessageAccessor.getMessage(null, TAX_ID_ALREADY_EXISTS);
			throw new RegistrationException(msg);
		}
	}

}
