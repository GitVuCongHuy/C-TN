package com.example.coffeshop_springboot.repository;


import com.example.coffeshop_springboot.entity.User;
import com.example.coffeshop_springboot.entity.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserAuth_Repository extends JpaRepository<UserAuth,Long> {
    Optional<UserAuth> findByUsername(String username);
    boolean existsByUsername(String username);
    @Query("SELECT ua FROM UserAuth ua JOIN ua.user u WHERE u.email = :email")
    Optional<UserAuth> findByUserEmail(@Param("email") String email);

    @Query("SELECT u FROM UserAuth u WHERE u.auth_id = :auth_id")
    Optional<UserAuth> findByAuth_id(@Param("auth_id") Long authId);
    Optional<UserAuth> findByUser(User user);
}
