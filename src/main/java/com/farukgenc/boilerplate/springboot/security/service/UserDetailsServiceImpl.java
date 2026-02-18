package com.farukgenc.boilerplate.springboot.security.service;

import com.farukgenc.boilerplate.springboot.model.UserAccount;
import com.farukgenc.boilerplate.springboot.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Refactored for Multi-tenancy
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

	private static final String USERNAME_OR_PASSWORD_INVALID = "Invalid username or password.";

	private final UserAccountRepository userAccountRepository;

	@Override
	public UserDetails loadUserByUsername(String email) {

		final UserAccount userAccount = userAccountRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException(USERNAME_OR_PASSWORD_INVALID));

		// For initial login, we grant a generic USER role or empty.
		// Specific Company Roles are checked when generating the JWT with a selected
		// Company context.
		// Or we could load ALL roles here, but for now keeping it simple: identity
		// verification first.
		// Note: The original returned "AuthenticatedUserDto", but here we return Spring
		// Security User directly.

		return new User(userAccount.getEmail(), userAccount.getPassword(), Collections.emptyList());
	}
}
