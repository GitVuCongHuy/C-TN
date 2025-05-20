package com.example.coffeshop_springboot.service;

import com.example.coffeshop_springboot.dto.AdminNotificationDTO;
import com.example.coffeshop_springboot.dto.CustomerNotificationDTO; // Import DTO mới
import com.example.coffeshop_springboot.entity.Order_coffee_entity.Order;
import com.example.coffeshop_springboot.entity.Notification;
import com.example.coffeshop_springboot.entity.User; // Import User
import com.example.coffeshop_springboot.repository.NotificationRepository;
import com.example.coffeshop_springboot.repository.User_Repository; // Import UserRepository
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    public static final String NOTIFICATION_TYPE_NEW_ORDER_ADMIN = "NEW_ORDER_ADMIN";
    public static final String NOTIFICATION_TYPE_ORDER_STATUS_UPDATE_CUSTOMER = "ORDER_STATUS_UPDATE_CUSTOMER";

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private User_Repository userRepository; // Inject UserRepository

    // Tạo thông báo cho Admin khi có đơn hàng mới
    @Transactional
    public void createAdminNewOrderNotification(Order order) {
        log.info("Creating ADMIN notification for new order ID: {}", order.getOrderId());
        Notification notification = new Notification();
        notification.setTargetRole("DIRECTOR"); // Hoặc lấy danh sách role admin/staff
        notification.setOrder(order);
        notification.setMessage("New order #" + order.getOrderId() + " placed by " +
                (order.getUser() != null ? order.getUser().getName() : order.getRecipientName() != null ? order.getRecipientName() : "Guest") +
                ".");
        notification.setRead(false);
        notification.setNotificationType(NOTIFICATION_TYPE_NEW_ORDER_ADMIN);
        notificationRepository.save(notification);
        log.info("ADMIN Notification saved for order ID: {}", order.getOrderId());
    }

    // --- THÊM MỚI: Tạo thông báo cho Customer khi trạng thái đơn hàng thay đổi ---
    @Transactional
    public void createCustomerOrderStatusUpdateNotification(Order order, String oldStatusName, String newStatusName) {
        if (order.getUser() == null) {
            log.warn("Order ID: {} does not have an associated user. Skipping customer notification.", order.getOrderId());
            return;
        }
        // Kiểm tra nếu trạng thái không thực sự thay đổi thì không gửi
        if (oldStatusName != null && oldStatusName.equalsIgnoreCase(newStatusName)) {
            log.info("Order ID: {} status ('{}') has not changed. Skipping customer notification.", order.getOrderId(), newStatusName);
            return;
        }

        log.info("Creating CUSTOMER notification for order ID: {} status update to '{}'", order.getOrderId(), newStatusName);
        Notification notification = new Notification();
        notification.setTargetUser(order.getUser()); // Set người nhận là khách hàng của đơn hàng
        notification.setOrder(order);
        notification.setMessage(String.format("Your order #%d %s.",
                order.getOrderId(), newStatusName));
        notification.setRead(false);
        notification.setNotificationType(NOTIFICATION_TYPE_ORDER_STATUS_UPDATE_CUSTOMER);
        notificationRepository.save(notification);
        log.info("CUSTOMER Notification saved for order ID: {}, user ID: {}", order.getOrderId(), order.getUser().getUserId());
    }

    // Lấy thông báo chưa đọc cho Admin
    @Transactional(readOnly = true)
    public List<AdminNotificationDTO> getUnreadAdminNotifications() {
        List<String> targetRoles = Arrays.asList("DIRECTOR", "EMPLOYEE");
        log.debug("Fetching unread admin notifications for roles: {}", targetRoles);
        // Chỉ lấy các thông báo có targetRole (không phải targetUser) và chưa đọc
        List<Notification> unreadNotifications = notificationRepository.findByTargetRoleInAndIsReadOrderByCreatedAtDesc(targetRoles, false);
        log.info("Found {} unread admin notifications", unreadNotifications.size());

        return unreadNotifications.stream()
                .map(this::mapToAdminNotificationDTO)
                .collect(Collectors.toList());
    }

    // --- THÊM MỚI: Lấy thông báo chưa đọc cho Customer ---
    @Transactional(readOnly = true)
    public List<CustomerNotificationDTO> getUnreadCustomerNotifications(Long userId) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        log.debug("Fetching unread customer notifications for user ID: {}", userId);
        List<Notification> unreadNotifications = notificationRepository.findByTargetUserAndIsReadFalseOrderByCreatedAtDesc(targetUser);
        log.info("Found {} unread customer notifications for user ID: {}", unreadNotifications.size(), userId);
        return unreadNotifications.stream()
                .map(this::mapToCustomerNotificationDTO)
                .collect(Collectors.toList());
    }


    // Trong NotificationService.java (phiên bản tôi đã cung cấp để sửa lỗi logic)

    @Transactional
    public boolean markNotificationAsRead(Integer notificationId, Long currentUserIdIfCustomer) {
        log.info("[MARK AS READ] Service method started. NotificationId: {}, CurrentUserIdIfCustomer: {}", notificationId, currentUserIdIfCustomer);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> {
                    log.warn("[MARK AS READ] Notification not found in repository with ID: {}", notificationId);
                    return new EntityNotFoundException("Notification not found with ID: " + notificationId);
                });
        log.info("[MARK AS READ] Notification object retrieved from repository. Notification ID from object: {}", notification.getId());

        // Log chi tiết về targetUser của notification object vừa lấy ra
        if (notification.getTargetUser() != null) {
            log.info("[MARK AS READ] Notification's TargetUser is NOT NULL. TargetUser ID from Entity: {}. TargetUser Name: {}",
                    notification.getTargetUser().getUserId(), notification.getTargetUser().getName()); // Giả sử User entity có getName()
        } else {
            log.warn("[MARK AS READ] Notification's TargetUser is NULL in the retrieved Entity object for notification ID: {}.", notificationId);
        }

        // Log lại các thông tin cơ bản một lần nữa để dễ so sánh
        log.debug("[MARK AS READ] Quick check - Found notification: ID={}, Actual TargetUser ID (if not null)={}, TargetRole={}",
                notification.getId(),
                (notification.getTargetUser() != null ? notification.getTargetUser().getUserId() : "TARGET_USER_IS_NULL"),
                notification.getTargetRole());

        // Bước 1: Kiểm tra quyền sở hữu nếu đây là thông báo dành cho customer
        if (notification.getTargetUser() != null) {
            log.debug("[MARK AS READ] Entered 'if (notification.getTargetUser() != null)' block.");
            // Đây là thông báo của một customer cụ thể

            if (currentUserIdIfCustomer == null) {
                log.warn("[MARK AS READ] SECURITY_VIOLATION: currentUserIdIfCustomer is NULL. Non-customer or unidentified user attempted to mark customer-specific notification ID: {}. Denying.", notificationId);
                return false;
            }
            log.debug("[MARK AS READ] currentUserIdIfCustomer is NOT NULL. Value: {}", currentUserIdIfCustomer);

            // Lấy ID của targetUser từ đối tượng notification một cách cẩn thận
            Long actualTargetUserId = notification.getTargetUser().getUserId(); // Chúng ta đã check targetUser không null ở trên
            log.info("[MARK AS READ] Comparing currentUserIdIfCustomer ({}) with actualTargetUserId (from notification.getTargetUser().getUserId()): {}",
                    currentUserIdIfCustomer, actualTargetUserId);

            // So sánh ID của người dùng sở hữu thông báo và ID của người dùng đang thực hiện request
            if (!actualTargetUserId.equals(currentUserIdIfCustomer)) {
                log.warn("[MARK AS READ] SECURITY_VIOLATION: User ID mismatch. CurrentUser {} attempted to mark notification {} (ID: {}), but it belongs to user {}. Access Denied.",
                        currentUserIdIfCustomer, notificationId, actualTargetUserId);
                return false;
            }

            log.info("[MARK AS READ] User ID match. User {} is authorized to mark notification {} (ID: {}) as read.",
                    currentUserIdIfCustomer, notificationId, actualTargetUserId);

        } else if (notification.getTargetRole() != null) {
            log.info("[MARK AS READ] Notification {} is admin/role-based (TargetUser is NULL, TargetRole is {}). Customer endpoint should ideally not handle this, but proceeding based on current logic.",
                    notificationId, notification.getTargetRole());
            // Hiện tại, nếu customer gọi endpoint này cho notif admin (targetUser null),
            // nó sẽ bỏ qua check if (notification.getTargetUser() != null), và đi xuống phần đánh dấu đọc.
            // Điều này có thể là một lỗ hổng nếu bạn không muốn customer tự ý đánh dấu đọc notif admin qua API này.
            // Tuy nhiên, @PreAuthorize("hasAuthority('CUSTOMER')") ở controller sẽ ngăn admin gọi endpoint này.
        } else {
            log.warn("[MARK AS READ] Notification {} has no targetUser and no targetRole. Undefined target. Considering this as unauthorized for safety.", notificationId);
            return false; // An toàn là từ chối nếu không rõ mục tiêu
        }

        // Bước 2: Nếu đã qua các kiểm tra quyền, tiến hành đánh dấu đã đọc
        log.info("[MARK AS READ] Proceeding to check if notification (ID: {}) needs to be marked as read. Current isRead state: {}", notificationId, notification.isRead());
        if (!notification.isRead()) {
            notification.setRead(true);
            log.info("[MARK AS READ] Set notification (ID: {}) isRead to true. Attempting to save to DB.", notificationId);
            try {
                notificationRepository.save(notification);
                log.info("[MARK AS READ] Successfully marked notification {} as read in DB.", notificationId);
                return true;
            } catch (Exception e) {
                log.error("[MARK AS READ] CRITICAL_ERROR: Failed to save notification (ID: {}) to DB after setting isRead to true. Error: {}", notificationId, e.getMessage(), e);
                // Bạn có thể muốn re-throw một custom exception ở đây hoặc xử lý khác
                // Việc return false ở đây có thể không phản ánh đúng là đã có lỗi DB.
                return false; // Hoặc throw new RuntimeException("Failed to save notification state", e);
            }
        } else {
            log.debug("[MARK AS READ] Notification {} was already marked as read. No DB update needed.", notificationId);
            return true; // Vẫn coi là thành công nếu đã đọc rồi
        }
    }

    // Đánh dấu thông báo của ADMIN đã đọc dựa trên OrderId
    // Phương thức này chỉ nên dùng cho admin, vì nó không phân biệt user cụ thể
    @Transactional
    public void markAdminNotificationByOrderIdAsRead(Integer orderId) {
        log.debug("Attempting to find and mark unread ADMIN notification for order ID: {}", orderId);

        // Tìm thông báo ADMIN (targetUser IS NULL hoặc targetRole IS NOT NULL) chưa đọc liên quan đến orderId
        List<Notification> notificationsToMark = notificationRepository.findUnreadAdminNotificationsByOrderId(orderId);

        if (notificationsToMark.isEmpty()) {
            log.info("No unread ADMIN notifications found for order ID: {} to mark as read", orderId);
            return;
        }

        notificationsToMark.forEach(notification -> {
            if (!notification.isRead()) {
                notification.setRead(true);
                notificationRepository.save(notification);
                log.info("Marked ADMIN notification ID: {} for order ID: {} as read.", notification.getId(), orderId);
            }
        });
    }


    private AdminNotificationDTO mapToAdminNotificationDTO(Notification notification) {
        Order order = notification.getOrder();
        String custName = "N/A";
        if (order != null) {
            if (order.getUser() != null && order.getUser().getName() != null && !order.getUser().getName().isEmpty()) {
                custName = order.getUser().getName();
            } else if (order.getRecipientName() != null && !order.getRecipientName().isEmpty()) {
                custName = order.getRecipientName();
            }
        }

        return new AdminNotificationDTO(
                // AdminNotificationDTO của bạn hiện chỉ có orderId, totalAmount, orderDate, customerName, isRead
                // Nó không có notificationId. Trong frontend, bạn đang dùng orderId làm key và để đánh dấu đã đọc.
                // Điều này có thể gây vấn đề nếu có nhiều thông báo admin cho cùng 1 order (ít khả năng với logic hiện tại)
                // Nên xem xét thêm notification.getId() vào AdminNotificationDTO nếu cần phân biệt chính xác.
                // Hiện tại giữ nguyên theo DTO của bạn:
                order != null ? order.getOrderId() : null,
                order != null ? order.getTotalAmount() : null,
                notification.getCreatedAt(), // Sử dụng createdAt của thông báo
                custName,
                notification.isRead()
        );
    }

    // --- THÊM MỚI: Mapper cho CustomerNotificationDTO ---
    private CustomerNotificationDTO mapToCustomerNotificationDTO(Notification notification) {
        Order order = notification.getOrder();
        return new CustomerNotificationDTO(
                notification.getId(), // ID của chính thông báo này
                order != null ? order.getOrderId() : null,
                notification.getMessage(),
                notification.getCreatedAt(),
                notification.isRead(),
                notification.getNotificationType()
        );
    }
}