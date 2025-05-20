package com.example.coffeshop_springboot.controller;

import com.example.coffeshop_springboot.dto.AdminNotificationDTO;
import com.example.coffeshop_springboot.dto.CustomerNotificationDTO; // Import
import com.example.coffeshop_springboot.entity.UserAuth; // Import
import com.example.coffeshop_springboot.service.NotificationService;
// import com.example.coffeshop_springboot.service.Order_coffee_service.OrderService; // Không cần OrderService ở đây nữa
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication; // Import
import org.springframework.security.core.context.SecurityContextHolder; // Import
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private NotificationService notificationService;

    // Endpoint cho Admin lấy thông báo
    @GetMapping("/admin")
    @PreAuthorize("hasAnyAuthority('DIRECTOR', 'EMPLOYEE')")
    public ResponseEntity<List<AdminNotificationDTO>> getAdminNotifications() {
        log.info("Request received for admin notifications");
        try {
            List<AdminNotificationDTO> notifications = notificationService.getUnreadAdminNotifications();
            log.info("Returning {} unread admin notifications", notifications.size());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error fetching admin notifications", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }

    // Endpoint cho Admin đánh dấu thông báo đã đọc (dựa trên Order ID)
    @PutMapping("/admin/order/{orderId}/read")
    @PreAuthorize("hasAnyAuthority('DIRECTOR', 'EMPLOYEE')")
    public ResponseEntity<Void> markAdminNotificationByOrderIdAsRead(@PathVariable Integer orderId) {
        log.info("ADMIN: Request to mark notification for order {} as read", orderId);
        try {
            notificationService.markAdminNotificationByOrderIdAsRead(orderId);
            log.info("ADMIN: Successfully marked notifications for order {} as read", orderId);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            log.warn("ADMIN: No unread notification found for order {} to mark as read", orderId, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("ADMIN: Error marking notification for order {} as read", orderId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- THÊM MỚI: Endpoints cho Customer ---

    // Endpoint cho Customer lấy thông báo chưa đọc
    @GetMapping("/customer")
    @PreAuthorize("hasAuthority('CUSTOMER')") // Hoặc bạn có thể kiểm tra role thủ công nếu không dùng @PreAuthorize rộng rãi
    public ResponseEntity<List<CustomerNotificationDTO>> getCustomerNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserAuth)) {
            log.warn("Customer notifications request from unauthenticated or invalid user type.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.emptyList());
        }
        UserAuth currentUserAuth = (UserAuth) authentication.getPrincipal();
        Long customerId = currentUserAuth.getUser().getUserId();
        log.info("Request received for customer notifications for user ID: {}", customerId);

        try {
            List<CustomerNotificationDTO> notifications = notificationService.getUnreadCustomerNotifications(customerId);
            log.info("Returning {} unread customer notifications for user ID: {}", notifications.size(), customerId);
            return ResponseEntity.ok(notifications);
        } catch (EntityNotFoundException e) {
            log.warn("Customer not found while fetching notifications for user ID: {}", customerId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
        } catch (Exception e) {
            log.error("Error fetching customer notifications for user ID: {}", customerId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }

    // Endpoint cho Customer đánh dấu một thông báo cụ thể đã đọc (dựa trên Notification ID)
    @PutMapping("/customer/{notificationId}/read")
    @PreAuthorize("hasAuthority('CUSTOMER')")
    public ResponseEntity<Void> markCustomerNotificationAsRead(@PathVariable Integer notificationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserAuth)) {
            log.warn("Customer mark notification as read request from unauthenticated or invalid user type.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserAuth currentUserAuth = (UserAuth) authentication.getPrincipal();
        Long customerId = currentUserAuth.getUser().getUserId();

        log.info("CUSTOMER: Request from user ID {} to mark notification ID {} as read", customerId, notificationId);
        try {
            boolean success = notificationService.markNotificationAsRead(notificationId, customerId);
            if (success) {
                log.info("CUSTOMER: Successfully marked notification ID {} as read for user ID {}", notificationId, customerId);
                return ResponseEntity.ok().build();
            } else {
                // Trường hợp service trả về false (ví dụ: không tìm thấy hoặc không có quyền)
                log.warn("CUSTOMER: Failed to mark notification ID {} as read for user ID {}. Notification not found or access denied.", notificationId, customerId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // Hoặc NOT_FOUND tùy logic của service
            }
        } catch (EntityNotFoundException e) {
            log.warn("CUSTOMER: Notification ID {} not found when user ID {} attempted to mark as read.", notificationId, customerId, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("CUSTOMER: Error marking notification ID {} as read for user ID {}", notificationId, customerId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}