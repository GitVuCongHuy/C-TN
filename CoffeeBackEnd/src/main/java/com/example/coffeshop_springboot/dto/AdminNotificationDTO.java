package com.example.coffeshop_springboot.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AdminNotificationDTO {
    private Integer orderId;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
     private String customerName;
     private boolean isRead;

    public AdminNotificationDTO(Integer orderId, BigDecimal totalAmount, LocalDateTime orderDate, String customerName, boolean isRead) {
        this.orderId = orderId;
        this.totalAmount = totalAmount;
        this.orderDate = orderDate;
        this.customerName = customerName;
        this.isRead = isRead;

    }
    public Integer getOrderId() { return orderId; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public LocalDateTime getOrderDate() { return orderDate; }
    public String getCustomerName() { return customerName; }
    public boolean isRead() { return isRead; }
}