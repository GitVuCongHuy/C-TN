package com.example.coffeshop_springboot.repository;

import com.example.coffeshop_springboot.entity.Role;
import com.example.coffeshop_springboot.entity.User;
import com.example.coffeshop_springboot.entity.UserRole;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRole_Repository extends JpaRepository<UserRole,Long> {
    List<UserRole> findByUser_UserId(Long id);
    Optional<UserRole> findByUserAndRole(User user, Role role);
    @Transactional
    void deleteByUser_UserId(Long userId);
}
