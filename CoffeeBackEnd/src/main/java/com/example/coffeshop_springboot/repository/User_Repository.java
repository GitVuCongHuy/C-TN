package com.example.coffeshop_springboot.repository;

import com.example.coffeshop_springboot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface User_Repository extends JpaRepository<User, Long> {
    Optional<User> findByUserId(Long id);  // Use 'user_id' as the field name in the entity
    Optional<User> findByEmail(String email);

}