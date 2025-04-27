package com.example.coffeshop_springboot.entity;

import com.example.coffeshop_springboot.entity.Order_coffee_entity.Order;
import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications") // Tên bảng trong DB

public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Integer id;

    public Integer getId() {
        return id;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public Order getOrder() {
        return order;
    }

    public String getMessage() {
        return message;
    }

    public boolean isRead() {
        return isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Người nhận thông báo (có thể là User hoặc Role)
    // Nếu cho nhiều admin/staff, có thể dùng ManyToMany với User hoặc lưu role
    // Ví dụ đơn giản: Lưu vai trò cần nhận
    @Column(name = "target_role", nullable = false)
    private String targetRole; // Ví dụ: "DIRECTOR", "EMPLOYEE"

    // Liên kết tới đơn hàng (nếu thông báo về đơn hàng)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order; // Liên kết tới Order entity

    @Column(nullable = false)
    private String message; // Nội dung thông báo

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false; // Mặc định là chưa đọc

    @CreationTimestamp // Tự động set thời gian tạo
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

}
