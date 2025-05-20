package com.example.coffeshop_springboot.entity;

import com.example.coffeshop_springboot.entity.Order_coffee_entity.Order;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Integer id;

    // Giữ lại targetRole cho thông báo admin hiện tại
    @Column(name = "target_role") // Cho phép null nếu targetUser được set
    private String targetRole; // Ví dụ: "DIRECTOR", "EMPLOYEE"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id", referencedColumnName = "user_id") // Cột mới trong DB
    private User targetUser; // Người dùng cụ thể nhận thông báo (customer)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(nullable = false)
    private String message;

    @Column(name = "notification_type", nullable = false) // Cột mới trong DB
    private String notificationType; // Ví dụ: "NEW_ORDER_ADMIN", "ORDER_STATUS_UPDATE_CUSTOMER"

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Notification() {
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public User getTargetUser() {
        return targetUser;
    }

    public void setTargetUser(User targetUser) {
        this.targetUser = targetUser;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}