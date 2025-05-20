package com.example.coffeshop_springboot.config;

import com.example.coffeshop_springboot.entity.UserAuth;
import com.example.coffeshop_springboot.entity.UserRole;
import com.example.coffeshop_springboot.repository.UserAuth_Repository;
import com.example.coffeshop_springboot.service.UserRole_Service;
import com.example.coffeshop_springboot.util.JwtUtil;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class); // Sử dụng SLF4J

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRole_Service userRoleService;

    @Autowired
    private UserAuth_Repository userAuthRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = getTokenFromRequest(request);

        if (token != null) {
            try {
                UserAuth userAuthFromToken = jwtUtil.extractUserAuth(token);

                if (userAuthFromToken == null || userAuthFromToken.getAuth_id() == null) {
                    logger.warn("UserAuth or Auth ID from token is null. Skipping authentication for token: {}", token);
                } else {
                    Optional<UserAuth> userAuthOptional = userAuthRepository.findByAuth_id(userAuthFromToken.getAuth_id());

                    if (userAuthOptional.isPresent()) {
                        UserAuth authenticatedUser = userAuthOptional.get();
                        if (authenticatedUser.getUser() != null) {
                            List<UserRole> userRoleList = userRoleService.find_role_by_user_id(authenticatedUser.getUser().getUserId());
                            userRoleList = (userRoleList == null) ? Collections.emptyList() : userRoleList;

                            List<GrantedAuthority> authorities = userRoleList.stream()
                                    .filter(userRole -> userRole.getRole() != null && userRole.getRole().getRoleName() != null)
                                    .map(userRole -> new SimpleGrantedAuthority(userRole.getRole().getRoleName()))
                                    .collect(Collectors.toList());

                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(authenticatedUser, null, authorities);
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            logger.debug("User {} authenticated with authorities: {}", authenticatedUser.getUsername(), authorities);
                        } else {
                            logger.warn("UserAuth ID {} found, but associated User entity is null.", authenticatedUser.getAuth_id());
                        }
                    } else {
                        logger.warn("UserAuth not found in repository for Auth ID from token: {}", userAuthFromToken.getAuth_id());
                    }
                }
            } catch (JwtException jwtEx) {
                logger.warn("Invalid JWT Token: {}", jwtEx.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid or Expired Token: " + jwtEx.getMessage());
                return;
            } catch (NoSuchElementException nsee) {
                logger.warn("User for token not found in repository: {}", nsee.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("User associated with token not found.");
                return;
            } catch (Exception e) {
                logger.error("Unexpected error during JWT authentication processing for token [{}]: {}", token, e.getMessage(), e);
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("Internal server error during authentication.");
                return;
            }
        } else {
            logger.trace("No token found in request to {}. Proceeding without authentication context setup.", request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}