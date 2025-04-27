package com.example.coffeshop_springboot.service;

import com.example.coffeshop_springboot.dto.AdminNotificationDTO;
import com.example.coffeshop_springboot.entity.Order_coffee_entity.Order;
import com.example.coffeshop_springboot.entity.Notification;
import com.example.coffeshop_springboot.repository.NotificationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    // Tạo thông báo mới khi có sự kiện (ví dụ: đặt hàng)
    @Transactional
    public void createOrderNotification(Order order) {
        log.info("Creating notification for new order ID: {}", order.getOrderId());
        Notification notification = new Notification();
        notification.setTargetRole("DIRECTOR"); // Hoặc cả "EMPLOYEE" nếu cần
        notification.setOrder(order);
        notification.setMessage("New order #" + order.getOrderId() + " placed.");
        notification.setRead(false); // Quan trọng: Đặt là chưa đọc
        notificationRepository.save(notification);
        log.info("Notification saved for order ID: {}", order.getOrderId());
        // Nếu cần gửi cho nhiều role, tạo nhiều record hoặc thay đổi cấu trúc targetRole
    }

    // Lấy các thông báo CHƯA ĐỌC cho admin/staff
    @Transactional(readOnly = true)
    public List<AdminNotificationDTO> getUnreadAdminNotifications() {
        List<String> targetRoles = Arrays.asList("DIRECTOR", "EMPLOYEE"); // Các role nhận thông báo
        log.debug("Fetching unread notifications for roles: {}", targetRoles);
        List<Notification> unreadNotifications = notificationRepository.findByTargetRoleInAndIsReadFalseOrderByCreatedAtDesc(targetRoles);
        log.info("Found {} unread admin notifications", unreadNotifications.size());

        return unreadNotifications.stream()
                .map(this::mapToAdminNotificationDTO) // Tạo hàm map riêng cho gọn
                .collect(Collectors.toList());
    }

    // Đánh dấu thông báo đã đọc
    @Transactional
    public void markAsRead(Integer notificationId) {
        log.debug("Attempting to mark notification {} as read", notificationId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> {
                    log.warn("Notification not found with ID: {}", notificationId);
                    return new EntityNotFoundException("Notification not found with ID: " + notificationId);
                });

        if (!notification.isRead()) {
            notification.setRead(true);
            notificationRepository.save(notification);
            log.info("Marked notification {} as read", notificationId);
        } else {
            log.debug("Notification {} was already marked as read", notificationId);
        }
    }

    @Transactional
    public void markAsReadByOrderId(Integer orderId) {
        log.debug("Attempting to find and mark unread notification for order ID: {}", orderId);

        // Tìm thông báo CHƯA ĐỌC mới nhất liên quan đến orderId này
        Notification notificationToMark = notificationRepository
                .findFirstByOrderOrderIdAndIsReadFalseOrderByCreatedAtDesc(orderId) // Gọi hàm repo mới
                .orElseThrow(() -> {
                    // Ghi log và throw exception nếu không tìm thấy thông báo chưa đọc cho order này
                    log.warn("No unread notification found for order ID: {} to mark as read", orderId);
                    return new EntityNotFoundException("No unread notification found for order ID: " + orderId);
                });

        // Nếu tìm thấy, gọi lại hàm markAsRead với ID của thông báo tìm được
        log.info("Found unread notification ID: {} for order ID: {}. Marking it as read.",
                notificationToMark.getId(), orderId);
        this.markAsRead(notificationToMark.getId()); // Gọi hàm markAsRead hiện có
    }

    // Hàm helper để map Notification entity sang DTO
    private AdminNotificationDTO mapToAdminNotificationDTO(Notification notification) {
        Order order = notification.getOrder();
        String custName = "N/A"; // Default
        if (order != null) {
            if (order.getUser() != null && order.getUser().getName() != null && !order.getUser().getName().isEmpty()) {
                custName = order.getUser().getName();
            } else if (order.getRecipientName() != null && !order.getRecipientName().isEmpty()) {
                custName = order.getRecipientName();
            }
        }

        return new AdminNotificationDTO(
                order != null ? order.getOrderId() : null, // Lấy orderId từ Order liên kết
                order != null ? order.getTotalAmount() : null,
                notification.getCreatedAt(), // Lấy ngày tạo thông báo thay vì ngày đặt hàng? Hoặc vẫn là ngày đặt hàng tùy bạn
                custName,
                notification.isRead() // Lấy trạng thái isRead từ Notification entity
        );
    }
}
