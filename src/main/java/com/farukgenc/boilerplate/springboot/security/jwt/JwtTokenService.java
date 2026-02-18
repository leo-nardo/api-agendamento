package com.farukgenc.boilerplate.springboot.security.jwt;

import com.farukgenc.boilerplate.springboot.model.CompanyUser;
import com.farukgenc.boilerplate.springboot.model.UserAccount;
import com.farukgenc.boilerplate.springboot.model.UserRole;
import com.farukgenc.boilerplate.springboot.repository.CompanyUserRepository;
import com.farukgenc.boilerplate.springboot.repository.UserAccountRepository;
import com.farukgenc.boilerplate.springboot.security.dto.LoginRequest;
import com.farukgenc.boilerplate.springboot.security.dto.LoginResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtTokenService {

	private final UserAccountRepository userAccountRepository;
	private final CompanyUserRepository companyUserRepository;
	private final JwtTokenManager jwtTokenManager;
	private final AuthenticationManager authenticationManager;

	public LoginResponse getLoginResponse(LoginRequest loginRequest) {

		final String email = loginRequest.getUsername(); // We use email as username
		final String password = loginRequest.getPassword();

		final UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
				email, password);

		authenticationManager.authenticate(usernamePasswordAuthenticationToken);

		final UserAccount userAccount = userAccountRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("User not found after authentication")); // Should be
																									// unreachable if
																									// auth success

		java.util.UUID companyId = loginRequest.getCompanyId();
		UserRole role = UserRole.PROFESSIONAL; // Default fallback if no company context, or handle differently

		if (Objects.nonNull(companyId)) {
			// Verify user belongs to company
			CompanyUser companyUser = companyUserRepository.findByUserIdAndCompanyId(userAccount.getId(), companyId)
					.orElseThrow(() -> new RuntimeException("User does not belong to the specified company"));
			role = companyUser.getRole();
		} else {
			// If no company selected, we could return a global token or pick the first
			// company
			// For now, let's pick the first one found or fail if none
			// MVP: Try to find any company
			var companies = companyUserRepository.findByUserId(userAccount.getId());
			if (!companies.isEmpty()) {
				CompanyUser first = companies.get(0);
				companyId = first.getCompanyId();
				role = first.getRole();
			} else {
				// User has no companies. Maybe a platform admin or just registered?
				// Allow login but strictly with no data access?
				// We'll pass companyId=null and role=null or handle in TokenManager
				companyId = null;
				role = UserRole.ADMIN; // Placeholder or specific NO_ACCESS role
			}
		}

		final String token = jwtTokenManager.generateToken(userAccount, companyId, role);

		log.info("{} has successfully logged in!", userAccount.getEmail());

		return new LoginResponse(token);
	}
}
