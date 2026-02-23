package com.farukgenc.boilerplate.springboot.security.service;

import com.farukgenc.boilerplate.springboot.model.Company;
import com.farukgenc.boilerplate.springboot.model.CompanyUser;
import com.farukgenc.boilerplate.springboot.model.Professional;
import com.farukgenc.boilerplate.springboot.model.UserAccount;
import com.farukgenc.boilerplate.springboot.model.Role;
import com.farukgenc.boilerplate.springboot.repository.CompanyRepository;
import com.farukgenc.boilerplate.springboot.repository.CompanyUserRepository;
import com.farukgenc.boilerplate.springboot.repository.ProfessionalRepository;
import com.farukgenc.boilerplate.springboot.repository.UserAccountRepository;
import com.farukgenc.boilerplate.springboot.repository.RoleRepository;
import com.farukgenc.boilerplate.springboot.security.dto.RegistrationRequest;
import com.farukgenc.boilerplate.springboot.security.dto.RegistrationResponse;
import com.farukgenc.boilerplate.springboot.service.UserValidationService;
import com.farukgenc.boilerplate.springboot.utils.GeneralMessageAccessor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

	private static final String REGISTRATION_SUCCESSFUL = "registration_successful";

	private final UserAccountRepository userAccountRepository;
	private final CompanyRepository companyRepository;
	private final CompanyUserRepository companyUserRepository;
	private final ProfessionalRepository professionalRepository;
	private final RoleRepository roleRepository;

	private final BCryptPasswordEncoder bCryptPasswordEncoder;

	private final UserValidationService userValidationService;

	private final GeneralMessageAccessor generalMessageAccessor;

	@Override
	public UserAccount findByEmail(String email) {
		return userAccountRepository.findByEmail(email).orElse(null);
	}

	@Override
	@Transactional
	public RegistrationResponse registration(RegistrationRequest registrationRequest) {

		userValidationService.validateUser(registrationRequest);

		String baseSlug = registrationRequest.getCompanyName().toLowerCase().replaceAll("[^a-z0-9]", "-")
				.replaceAll("-+", "-").replaceAll("-$", "").replaceAll("^-", "");
		String finalSlug = baseSlug.isEmpty() ? "company-" + java.util.UUID.randomUUID().toString().substring(0, 8)
				: baseSlug;

		Company company = Company.builder()
				.legalName(registrationRequest.getCompanyName())
				.taxId(registrationRequest.getTaxId())
				.slug(finalSlug)
				.active(true)
				.build();
		company = companyRepository.save(company);

		UserAccount user = UserAccount.builder()
				.email(registrationRequest.getEmail())
				.password(bCryptPasswordEncoder.encode(registrationRequest.getPassword()))
				.fullName(registrationRequest.getFullName())
				.phoneNumber(registrationRequest.getPhoneNumber())
				.active(true)
				.build();

		user = userAccountRepository.save(user);

		CompanyUser companyUser = CompanyUser.builder()
				.companyId(company.getId())
				.userId(user.getId())
				.role(roleRepository.findByName("OWNER")
						.orElseThrow(() -> new RuntimeException("Role OWNER not found")))
				.build();

		companyUserRepository.save(companyUser);

		// 4. Create Professional Record (Owner is also a Professional)
		Professional professional = Professional.builder()
				.companyId(company.getId())
				.userAccount(user)
				.active(true)
				.build();
		professionalRepository.save(professional);

		final String email = registrationRequest.getEmail();
		final String registrationSuccessMessage = generalMessageAccessor.getMessage(null, REGISTRATION_SUCCESSFUL,
				email);

		log.info("{} registered successfully as Owner of {}!", email, company.getLegalName());

		return new RegistrationResponse(registrationSuccessMessage, company.getId());
	}
}
