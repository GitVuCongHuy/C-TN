package com.example.coffeshop_springboot.repository.Chain_coffee_repository;

import com.example.coffeshop_springboot.entity.Chain_coffee_entity.Chain;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface Chain_Repository extends JpaRepository<Chain,Long> {

    Optional<Chain> findByChainId(Long chain_id);
}
