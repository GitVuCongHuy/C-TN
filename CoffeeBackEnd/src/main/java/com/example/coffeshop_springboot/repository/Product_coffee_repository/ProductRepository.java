package com.example.coffeshop_springboot.repository.Product_coffee_repository;

import com.example.coffeshop_springboot.entity.Product_coffee_entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    Optional<Product> findByProductId(Integer product_id);
    List<Product> findByProductIdIn(List<Integer> productIds);
}
