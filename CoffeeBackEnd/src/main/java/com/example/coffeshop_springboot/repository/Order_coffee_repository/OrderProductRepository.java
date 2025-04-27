package com.example.coffeshop_springboot.repository.Order_coffee_repository;

import com.example.coffeshop_springboot.entity.Order_coffee_entity.OrderProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderProductRepository extends JpaRepository<OrderProduct, Integer> {
    List<OrderProduct> findByOrder_OrderId(Integer orderId);
    List<OrderProduct> findByOrderUserUserId(Long userId);
    void deleteByProduct_ProductId(int productId);
}