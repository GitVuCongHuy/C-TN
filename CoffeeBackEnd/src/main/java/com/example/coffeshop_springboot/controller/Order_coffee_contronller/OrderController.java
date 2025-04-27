package com.example.coffeshop_springboot.controller.Order_coffee_contronller;

import com.example.coffeshop_springboot.dto.OrderDTO;
import com.example.coffeshop_springboot.dto.UpdateOrderStatusDTO;
import com.example.coffeshop_springboot.entity.Order_coffee_entity.Order;
import com.example.coffeshop_springboot.entity.Order_coffee_entity.OrderProduct; // Import
import com.example.coffeshop_springboot.entity.UserAuth;
import com.example.coffeshop_springboot.entity.Order_coffee_entity.OrderProduct;
import com.example.coffeshop_springboot.repository.Order_coffee_repository.OrderProductRepository; // Import
import com.example.coffeshop_springboot.service.EmailService;
import com.example.coffeshop_springboot.service.Order_coffee_service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
// Bỏ @Value nếu không dùng shopAdminEmail nữa
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.example.coffeshop_springboot.dto.AdminOrderViewDTO;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderService orderService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private OrderProductRepository orderProductRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody OrderDTO orderDto) {
        UserAuth authenticatedUserAuth = null;
        String usernameForLog = "anonymous";

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            if (authentication.getPrincipal() instanceof UserAuth) {
                authenticatedUserAuth = (UserAuth) authentication.getPrincipal();
                if (authenticatedUserAuth != null) {
                    usernameForLog = authenticatedUserAuth.getUsername();
                    log.info("Order request from authenticated user (from SecurityContext): {}", usernameForLog);
                } else {
                    log.error("Principal is UserAuth but cast result is null!");
                }
            } else {
                log.warn("Authenticated user principal is not of type UserAuth. Actual type: {}", authentication.getPrincipal().getClass().getName());
            }
        } else {
            log.info("Order request from anonymous user (no authentication in SecurityContext).");
        }
        try {
            Order newOrder = orderService.createOrder(orderDto, authenticatedUserAuth);
            sendCustomerConfirmationEmail(newOrder, orderDto.getRecipientEmail(), authenticatedUserAuth, orderDto.getDeliveryOption());
            return new ResponseEntity<>(newOrder, HttpStatus.CREATED);

        } catch (IllegalArgumentException e) {
            log.error("Error creating order for user '{}' due to invalid input: {}", usernameForLog, e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            log.error("Internal error creating order for user '{}': {}", usernameForLog, e.getMessage(), e);
            String errorMessage = "An internal error occurred while creating the order.";
            if (e.getCause() instanceof org.hibernate.exception.ConstraintViolationException || e.getMessage().contains("not-null property")) {
                errorMessage = "Data conflict or missing required field (e.g., Payment Method).";
                return new ResponseEntity<>(errorMessage, HttpStatus.BAD_REQUEST);
            } else if (e.getMessage().contains("not found")) {
                errorMessage = e.getMessage();
                return new ResponseEntity<>(errorMessage, HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    private void sendCustomerConfirmationEmail(Order order, String recipientEmailFromForm, UserAuth authenticatedUserAuth, String deliveryOption) {

        if (!"delivery".equalsIgnoreCase(deliveryOption)) {
            log.info("Order ID {} is for store pickup, skipping customer email.", order.getOrderId());
            return;
        }
        String targetCustomerEmail = null;
        if (recipientEmailFromForm != null && !recipientEmailFromForm.isEmpty()) {
            targetCustomerEmail = recipientEmailFromForm;
            log.info("Target email for delivery Order ID {}: {} (from form)", order.getOrderId(), targetCustomerEmail);
        }

        if (targetCustomerEmail == null) {
            log.warn("No target customer email found (from form) to send confirmation for delivery order ID {}", order.getOrderId());
            return;
        }
        try {
            List<OrderProduct> orderProducts = orderProductRepository.findByOrder_OrderId(order.getOrderId());
            log.debug("Fetched {} products for order ID {}", orderProducts.size(), order.getOrderId());

            String emailSubject = "Xác nhận đơn hàng #" + order.getOrderId() + " tại Coffee Shop";
            StringBuilder emailBodyBuilder = new StringBuilder();
            emailBodyBuilder.append("Cảm ơn bạn đã đặt hàng!\n\n");
            emailBodyBuilder.append("Mã đơn hàng: ").append(order.getOrderId()).append("\n");
            emailBodyBuilder.append("Người nhận: ").append(order.getRecipientName()).append("\n");
            emailBodyBuilder.append("Điện thoại: ").append(order.getRecipientPhone()).append("\n");
            emailBodyBuilder.append("Địa chỉ giao hàng: ").append(order.getShippingAddress()).append("\n\n");
            emailBodyBuilder.append("Chi tiết sản phẩm:\n");

            if (orderProducts.isEmpty()) {
                emailBodyBuilder.append("- Không có thông tin chi tiết sản phẩm.\n");
            } else {
                for (OrderProduct op : orderProducts) {
                    // Tính tổng giá cho từng dòng sản phẩm
                    BigDecimal lineTotal = op.getPrice().multiply(new BigDecimal(op.getQuantity()));
                    emailBodyBuilder.append(String.format("- %d x %s (%.0f đ)\n", // Giá đã bao gồm số lượng
                            op.getQuantity(),
                            op.getProduct() != null ? op.getProduct().getName() : "N/A",
                            lineTotal
                    ));
                }
            }
            emailBodyBuilder.append("\nTổng tiền đơn hàng: ").append(order.getTotalAmount().toPlainString()).append(" đ\n\n");
            emailBodyBuilder.append("Chúng tôi sẽ liên hệ và giao hàng sớm nhất. Xin cảm ơn!\n");
            String emailBody = emailBodyBuilder.toString();

            emailService.send_Email_Data(targetCustomerEmail, emailSubject, emailBody);
            log.info("Successfully sent customer confirmation email for Order ID {} to {}", order.getOrderId(), targetCustomerEmail);

        } catch (Exception e) {
            log.error("Failed to fetch products or send confirmation email for Order ID {} to {}: {}", order.getOrderId(), targetCustomerEmail, e.getMessage(), e);
        }
    }
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable int orderId) {
        Optional<Order> orderOpt = orderService.findOrderById(orderId);
        if (orderOpt.isPresent()) {
            return ResponseEntity.ok(orderOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found with id: " + orderId);
        }
    }
    @GetMapping("/order_date")
    public ResponseEntity<List<AdminOrderViewDTO>> getOrdersByDateAsDTO(
                                                                         @RequestParam("startDate") String startDateStr,
                                                                         @RequestParam("endDate") String endDateStr) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDateStr);
            LocalDateTime end = LocalDateTime.parse(endDateStr);
            List<AdminOrderViewDTO> orderDTOs = orderService.getOrdersByDateRangeAsDTO(start, end);
            return ResponseEntity.ok(orderDTOs);
        } catch (Exception e) {
            log.error("Error fetching orders by date range ({} - {}): {}", startDateStr, endDateStr, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    @PutMapping("/update_status")
    public ResponseEntity<String> updateOrderStatus(@RequestBody UpdateOrderStatusDTO dto) {
        try {
            orderService.updateOrderStatus(dto.getOrderId(), dto.getStatusId());
            return ResponseEntity.ok("Order status updated successfully.");
        } catch (jakarta.persistence.EntityNotFoundException e) { // Bắt lỗi cụ thể hơn
            log.warn("Failed to update status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error updating order status for order ID {}: {}", dto.getOrderId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An internal error occurred while updating status.");
        }
    }
}