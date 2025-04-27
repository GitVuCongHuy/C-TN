package com.example.coffeshop_springboot.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/user/**",
                                "/api/notifications/admin",
                                "/api/orders/order_date",
                                "/api/user_data/**",
                                "/api/users/profile",
                                "/order_products/order/{orderId}",
                                "/order_products/order_all",
                                "/api/orders/create",
                                "/order_products/user",
                                "/token/**",
                                "/chain/**",
                                "/chain_sales/**",
                                "/product/**",
                                "/menu/**",
                                "/api/orders/**",
                                "/api/orders",
                                "/orders/anonymous/**",
                                "/payment-methods/**",
                                "/chain/get_all",
                                "/order_products/**",
                                "/status/**",
                                "/**"
                        ).permitAll() // Truy cập công khai
                        .requestMatchers("/user_role/**").hasAuthority("MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/notifications/admin/**/read").hasAnyAuthority("DIRECTOR", "EMPLOYEE")
                        .requestMatchers("/order_products/order_all").hasRole("ADMIN")
                        .requestMatchers("/api/chatbot/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}