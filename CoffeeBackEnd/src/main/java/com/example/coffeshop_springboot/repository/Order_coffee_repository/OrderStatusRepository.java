package com.example.coffeshop_springboot.repository.Order_coffee_repository;

import com.example.coffeshop_springboot.entity.Order_coffee_entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderStatusRepository extends JpaRepository<OrderStatus, Integer> {
    Optional<OrderStatus> findByStatusId(Integer id);
}