package com.example.coffeshop_springboot.repository;

import com.example.coffeshop_springboot.entity.Notification;
import com.example.coffeshop_springboot.entity.User; // Import User
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    // Giữ lại phương thức cũ cho admin (dựa trên orderId)
    Optional<Notification> findFirstByOrderOrderIdAndTargetRoleIsNotNullAndIsReadFalseOrderByCreatedAtDesc(Integer orderId);

    // Phương thức cũ cho admin (dựa trên role)
    List<Notification> findByTargetRoleInAndIsReadOrderByCreatedAtDesc(List<String> roles, boolean isRead);

    // --- THÊM MỚI CHO CUSTOMER ---
    // Lấy thông báo chưa đọc cho một User cụ thể, sắp xếp theo thời gian tạo mới nhất
    List<Notification> findByTargetUserAndIsReadFalseOrderByCreatedAtDesc(User targetUser);

    // Lấy tất cả thông báo (cả đọc và chưa đọc) cho một User cụ thể, sắp xếp theo thời gian tạo mới nhất
    List<Notification> findByTargetUserOrderByCreatedAtDesc(User targetUser);

    // Nếu bạn muốn một phương thức đánh dấu đã đọc cho admin mà chỉ dựa vào orderId,
    // bạn cần đảm bảo nó chỉ nhắm vào thông báo của admin.
    // Ví dụ: tìm thông báo admin chưa đọc liên quan đến orderId
    @Query("SELECT n FROM Notification n WHERE n.order.orderId = :orderId AND n.targetUser IS NULL AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadAdminNotificationsByOrderId(@Param("orderId") Integer orderId);

}