package com.example.coffeshop_springboot.dto;

import java.time.LocalDateTime;

public class CustomerNotificationDTO {
    private Integer notificationId; // ID của thông báo, không phải orderId
    private Integer orderId;
    private String message;
    private LocalDateTime createdAt;
    private boolean isRead;
    private String notificationType; // Để frontend có thể xử lý hiển thị khác nhau nếu cần

    // Constructor
    public CustomerNotificationDTO(Integer notificationId, Integer orderId, String message, LocalDateTime createdAt, boolean isRead, String notificationType) {
        this.notificationId = notificationId;
        this.orderId = orderId;
        this.message = message;
        this.createdAt = createdAt;
        this.isRead = isRead;
        this.notificationType = notificationType;
    }

    // Getters
    public Integer getNotificationId() {
        return notificationId;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean isRead() {
        return isRead;
    }

    public String getNotificationType() {
        return notificationType;
    }

    // Setters (nếu cần)
    public void setNotificationId(Integer notificationId) {
        this.notificationId = notificationId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }
}