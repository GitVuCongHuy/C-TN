package com.example.coffeshop_springboot.controller;

import com.example.coffeshop_springboot.dto.AdminNotificationDTO;
import com.example.coffeshop_springboot.service.NotificationService;
import com.example.coffeshop_springboot.service.Order_coffee_service.OrderService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private OrderService orderService;

    @GetMapping("/admin")
    @PreAuthorize("hasAnyAuthority('DIRECTOR', 'EMPLOYEE')")
    public ResponseEntity<List<AdminNotificationDTO>> getAdminNotifications() {
        log.info("Request received for admin notifications");
        try {
            // *** GỌI SERVICE MỚI ĐỂ LẤY THÔNG BÁO CHƯA ĐỌC ***
            List<AdminNotificationDTO> notifications = notificationService.getUnreadAdminNotifications();
            log.info("Returning {} unread admin notifications", notifications.size());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error fetching admin notifications", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    @PutMapping("/admin/order/{orderId}/read") // <-- Đổi đường dẫn, dùng orderId
    @PreAuthorize("hasAnyAuthority('DIRECTOR', 'EMPLOYEE')")
    public ResponseEntity<Void> markNotificationByOrderIdAsRead(@PathVariable Integer orderId) { // <-- Đổi tên tham số và phương thức cho rõ
        log.info("BACKEND: Request to mark notification for order {} as read", orderId);
        try {
            // *** GỌI PHƯƠNG THỨC SERVICE MỚI ***
            notificationService.markAsReadByOrderId(orderId); // <-- Gọi hàm mới trong service
            log.info("BACKEND: Successfully marked notification for order {} as read", orderId);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            log.warn("BACKEND: No unread notification found for order {} to mark as read", orderId, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("BACKEND: Error marking notification for order {} as read", orderId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}