package com.example.coffeshop_springboot.repository.Product_coffee_repository;

import com.example.coffeshop_springboot.entity.Product_coffee_entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuRepository extends JpaRepository<Menu, Integer> {
}
