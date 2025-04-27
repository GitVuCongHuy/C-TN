package com.example.coffeshop_springboot.repository.Chain_coffee_repository;

import com.example.coffeshop_springboot.entity.Chain_coffee_entity.Chain;
import com.example.coffeshop_springboot.entity.Chain_coffee_entity.Sales;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface Sales_Repository extends JpaRepository<Sales,Long> {

    Optional<Sales> findBySalesId(Long chain_id);
}
