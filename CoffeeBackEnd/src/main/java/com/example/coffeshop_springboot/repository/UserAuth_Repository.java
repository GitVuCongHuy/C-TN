package com.example.coffeshop_springboot.repository;


import com.example.coffeshop_springboot.entity.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserAuth_Repository extends JpaRepository<UserAuth,Long> {
    Optional<UserAuth> findByUsername(String username);

    Optional<UserAuth> findByUserEmail(String email);

    @Query("SELECT u FROM UserAuth u WHERE u.auth_id = :auth_id")
    Optional<UserAuth> findByAuth_id(@Param("auth_id") Long authId);
}
