package com.example.coffeshop_springboot.repository.Order_coffee_repository;

import com.example.coffeshop_springboot.entity.Order_coffee_entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    @Query("SELECT o FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate ORDER BY o.orderId DESC")
    List<Order> findOrdersByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // *** THÊM PHƯƠNG THỨC NÀY ĐỂ LẤY ĐƠN HÀNG MỚI NHẤT CHO ADMIN ***
    // Lấy 10 đơn hàng mới nhất (có thể lọc theo delivery nếu cần và có trường đó)
    List<Order> findTop10ByOrderByOrderDateDesc();
}
