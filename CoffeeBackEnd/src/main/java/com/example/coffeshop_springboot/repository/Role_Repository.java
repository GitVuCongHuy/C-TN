package com.example.coffeshop_springboot.repository;

import com.example.coffeshop_springboot.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface Role_Repository extends JpaRepository<Role,Long> {
    Optional<Role> findByRoleName(String roleName);
}
