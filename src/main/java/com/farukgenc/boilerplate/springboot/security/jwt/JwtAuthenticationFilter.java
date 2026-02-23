package com.farukgenc.boilerplate.springboot.security.jwt;

import com.farukgenc.boilerplate.springboot.security.service.UserDetailsServiceImpl;
import com.farukgenc.boilerplate.springboot.security.utils.SecurityConstants;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.util.Strings;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Service;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtTokenManager jwtTokenManager;

	private final UserDetailsServiceImpl userDetailsService;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws IOException, ServletException {

		final String header = request.getHeader(SecurityConstants.HEADER_STRING);

		String username = null;
		String authToken = null;
		if (Objects.nonNull(header) && header.startsWith(SecurityConstants.TOKEN_PREFIX)) {

			authToken = header.replace(SecurityConstants.TOKEN_PREFIX, Strings.EMPTY);

			try {
				username = jwtTokenManager.getUsernameFromToken(authToken);
			} catch (Exception e) {
				log.error("Authentication Exception : {}", e.getMessage());
				chain.doFilter(request, response);
				return;
			}
		}

		final SecurityContext securityContext = SecurityContextHolder.getContext();

		final boolean canBeStartTokenValidation = Objects.nonNull(username)
				&& Objects.isNull(securityContext.getAuthentication());

		if (!canBeStartTokenValidation) {
			chain.doFilter(request, response);
			return;
		}

		final UserDetails user = userDetailsService.loadUserByUsername(username);
		final boolean validToken = jwtTokenManager.validateToken(authToken, user.getUsername());

		if (!validToken) {
			chain.doFilter(request, response);
			return;
		}

		// Extract Company ID and set context
		try {
			String companyIdStr = com.auth0.jwt.JWT.decode(authToken).getClaim("companyId").asString();
			if (companyIdStr != null) {
				com.farukgenc.boilerplate.springboot.security.TenantContext
						.setTenantId(java.util.UUID.fromString(companyIdStr));
			}
		} catch (Exception e) {
			log.warn("Could not extract companyId from token: {}", e.getMessage());
		}

		List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
		try {
			List<String> perms = com.auth0.jwt.JWT.decode(authToken).getClaim("permissions").asList(String.class);
			if (perms != null) {
				authorities = perms.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList());
			}

			// Also grab the role and prefix it if necessary, though permissions usually
			// suffice
			String roleClaim = com.auth0.jwt.JWT.decode(authToken).getClaim("role").asString();
			if (roleClaim != null) {
				authorities.add(new SimpleGrantedAuthority("ROLE_" + roleClaim));
			}
		} catch (Exception e) {
			log.warn("Could not extract permissions from token: {}", e.getMessage());
		}

		final UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(user, null,
				authorities.isEmpty() ? user.getAuthorities() : authorities);
		authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
		securityContext.setAuthentication(authentication);

		log.info("Authentication successful. Logged in username : {} ", username);

		try {
			chain.doFilter(request, response);
		} finally {
			com.farukgenc.boilerplate.springboot.security.TenantContext.clear();
		}
	}
}
