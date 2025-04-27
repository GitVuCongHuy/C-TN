package com.example.coffeshop_springboot.config;

import com.example.coffeshop_springboot.entity.UserAuth;
import com.example.coffeshop_springboot.entity.UserRole;
import com.example.coffeshop_springboot.repository.UserAuth_Repository;
import com.example.coffeshop_springboot.service.UserAuth_Service;
import com.example.coffeshop_springboot.service.UserRole_Service;
import com.example.coffeshop_springboot.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private  JwtUtil jwtUtil;

    @Autowired
    private UserRole_Service userRoleService;

    @Autowired
    private UserAuth_Service userAuthService;

    @Autowired
    private UserAuth_Repository userAuthRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = getTokenFromRequest(request);
        System.out.println(token);
        if (token!=null){
            try {
                UserAuth userAuth = jwtUtil.extractUserAuth(token);

                UserAuth userAuth1 = userAuthRepository.findByAuth_id(userAuth.getAuth_id()).get();
                List<UserRole> userRoleList = userRoleService.find_role_by_user_id(userAuth1.getUser().getUserId());
                for (UserRole role : userRoleList) {
                    System.out.println(role.getRole().getRoleName());
                }
                List<GrantedAuthority> authorities = userRoleList.stream()
                        .map(userRole -> new SimpleGrantedAuthority(userRole.getRole().getRoleName()))
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userAuth1, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                throw new RuntimeException(e);
            }
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
