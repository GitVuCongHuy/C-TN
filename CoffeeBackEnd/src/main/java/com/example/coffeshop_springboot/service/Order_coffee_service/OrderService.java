package com.example.coffeshop_springboot.service.Order_coffee_service;

import com.example.coffeshop_springboot.dto.AdminOrderViewDTO;
import com.example.coffeshop_springboot.dto.CartDTO;
import com.example.coffeshop_springboot.dto.OrderDTO;
import com.example.coffeshop_springboot.entity.Chain_coffee_entity.Chain;
import com.example.coffeshop_springboot.entity.Order_coffee_entity.Order;
import com.example.coffeshop_springboot.entity.Order_coffee_entity.OrderProduct;
import com.example.coffeshop_springboot.entity.Order_coffee_entity.OrderStatus;
import com.example.coffeshop_springboot.entity.Order_coffee_entity.PaymentMethod;
import com.example.coffeshop_springboot.entity.Product_coffee_entity.Product;
import com.example.coffeshop_springboot.entity.UserAuth;
import com.example.coffeshop_springboot.repository.Chain_coffee_repository.Chain_Repository;
import com.example.coffeshop_springboot.repository.Order_coffee_repository.OrderProductRepository;
import com.example.coffeshop_springboot.repository.Order_coffee_repository.OrderRepository;
import com.example.coffeshop_springboot.repository.Order_coffee_repository.OrderStatusRepository;
import com.example.coffeshop_springboot.repository.Order_coffee_repository.PaymentMethodRepository;
import com.example.coffeshop_springboot.repository.Product_coffee_repository.ProductRepository;
import com.example.coffeshop_springboot.repository.User_Repository;
import com.example.coffeshop_springboot.service.NotificationService; // *** THÊM IMPORT ***
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private User_Repository userRepository; // Có vẻ không dùng trực tiếp, có thể bỏ nếu User lấy từ UserAuth
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private OrderProductRepository orderProductRepository;
    @Autowired
    private OrderStatusRepository orderStatusRepository;
    @Autowired
    private PaymentMethodRepository paymentMethodRepository;
    @Autowired
    private Chain_Repository chainRepository;

    @Autowired // *** BƯỚC 1: INJECT NOTIFICATION SERVICE ***
    private NotificationService notificationService;

    // *** BƯỚC 2: XÓA PHƯƠNG THỨC NÀY HOÀN TOÀN ***
    /*
    @Transactional(readOnly = true)
    public List<AdminNotificationDTO> getRecentOrdersForAdminNotification() {
        // ... code cũ đã bị xóa ...
    }
    */

    @Transactional // Giữ @Transactional cho cả phương thức
    public Order createOrder(OrderDTO orderDto, UserAuth authenticatedUserAuth) {
        Order savedOrder = null; // Khai báo ở đây để có thể dùng trong catch block nếu cần
        try {
            // --- Tìm các entity liên quan ---
            log.debug("Finding related entities for new order");
            OrderStatus orderStatus = orderStatusRepository
                    .findByStatusId(1) // Mặc định là "Processing" khi tạo mới?
                    .orElseThrow(() -> new RuntimeException("Default OrderStatus (ID=1) not found."));

            PaymentMethod paymentMethod = paymentMethodRepository.findByPaymentMethodId(orderDto.getPayment_method_id());
            if (paymentMethod == null) { // Kiểm tra null rõ ràng hơn
                throw new RuntimeException("PaymentMethod not found for id: " + orderDto.getPayment_method_id());
            }


            Chain chain = chainRepository
                    .findByChainId(orderDto.getChain_id())
                    .orElseThrow(() -> new RuntimeException("Chain not found for id: " + orderDto.getChain_id()));

            // --- Tạo Order entity ---
            log.debug("Creating new Order entity");
            Order orderEntity = new Order();
            orderEntity.setPaymentMethod(paymentMethod);
            orderEntity.setStatus(orderStatus);
            orderEntity.setChain(chain);
            orderEntity.setTotalAmount(orderDto.getTotalAmount());

            // Gán User nếu đã đăng nhập
            if (authenticatedUserAuth != null && authenticatedUserAuth.getUser() != null) {
                log.debug("Assigning authenticated user (ID: {}) to order", authenticatedUserAuth.getUser().getUserId());
                orderEntity.setUser(authenticatedUserAuth.getUser());
                // Nếu user đăng nhập, có thể tự động điền thông tin người nhận nếu để trống
                if (orderDto.getRecipientName() == null || orderDto.getRecipientName().isEmpty()) {
                    orderEntity.setRecipientName(authenticatedUserAuth.getUser().getName());
                } else {
                    orderEntity.setRecipientName(orderDto.getRecipientName());
                }
                if (orderDto.getRecipientEmail() == null || orderDto.getRecipientEmail().isEmpty()) {
                    orderEntity.setRecipientEmail(authenticatedUserAuth.getUser().getEmail());
                } else {
                    orderEntity.setRecipientEmail(orderDto.getRecipientEmail());
                }
                if (orderDto.getRecipientPhone() == null || orderDto.getRecipientPhone().isEmpty()) {
                    orderEntity.setRecipientPhone(authenticatedUserAuth.getUser().getPhone_number());
                } else {
                    orderEntity.setRecipientPhone(orderDto.getRecipientPhone());
                }
                if (orderDto.getShippingAddress() == null || orderDto.getShippingAddress().isEmpty()) {
                    orderEntity.setShippingAddress(authenticatedUserAuth.getUser().getAddress());
                } else {
                    orderEntity.setShippingAddress(orderDto.getShippingAddress());
                }

            } else {
                log.debug("Creating order for guest user");
                orderEntity.setUser(null); // Đảm bảo là null nếu là guest
                // Lấy thông tin người nhận từ DTO cho guest
                orderEntity.setRecipientName(orderDto.getRecipientName());
                orderEntity.setRecipientEmail(orderDto.getRecipientEmail());
                orderEntity.setRecipientPhone(orderDto.getRecipientPhone());
                orderEntity.setShippingAddress(orderDto.getShippingAddress());
            }

            // --- Lưu Order chính ---
            savedOrder = orderRepository.save(orderEntity);
            log.info("Saved Order with ID: {}", savedOrder.getOrderId());

            // --- Xử lý OrderProduct ---
            if (orderDto.getProduct() == null || orderDto.getProduct().isEmpty()) {
                log.error("Order creation failed for Order ID {}: Order must contain at least one product.", savedOrder.getOrderId());
                throw new IllegalArgumentException("Order must contain at least one product.");
            }

            List<Integer> productIds = orderDto.getProduct().stream()
                    .map(CartDTO::getProductId)
                    .filter(Objects::nonNull) // Lọc ra các ID null nếu có
                    .distinct() // Tránh query trùng ID
                    .collect(Collectors.toList());

            log.debug("Fetching products with IDs: {}", productIds);
            List<Product> products = productRepository.findAllById(productIds);
            // Kiểm tra xem có lấy đủ product không
            if (products.size() != productIds.size()) {
                log.error("Order creation failed for Order ID {}: Could not find all products for IDs: {}", savedOrder.getOrderId(), productIds);
                throw new RuntimeException("Could not find all products for the order.");
            }

            // Tạo danh sách OrderProduct
            final Order finalSavedOrder = savedOrder; // Cần final để dùng trong lambda
            List<OrderProduct> orderProducts = orderDto.getProduct()
                    .stream()
                    .map(cartDTO -> {
                        Product product = products.stream()
                                .filter(p -> p.getProductId() == cartDTO.getProductId())
                                .findFirst()
                                // Không cần orElseThrow ở đây vì đã kiểm tra ở trên
                                .get(); // An toàn để gọi get()

                        OrderProduct orderProduct = new OrderProduct();
                        orderProduct.setProduct(product);
                        orderProduct.setQuantity(cartDTO.getQuantity());
                        orderProduct.setPrice(cartDTO.getPrice()); // Nên lấy giá từ Product entity hay DTO? Cân nhắc lấy từ Product để đảm bảo đúng giá tại thời điểm đặt
                        // orderProduct.setPrice(product.getPrice()); // Ví dụ: Lấy giá từ Product
                        orderProduct.setOrder(finalSavedOrder); // Tham chiếu đến Order vừa lưu
                        return orderProduct;
                    })
                    .collect(Collectors.toList());

            // --- Lưu OrderProduct ---
            orderProductRepository.saveAll(orderProducts);
            log.info("Saved {} OrderProduct items for Order ID: {}", orderProducts.size(), savedOrder.getOrderId());


            // *** BƯỚC 3: GỌI TẠO THÔNG BÁO ***
            try {
                log.debug("Attempting to create notification for Order ID: {}", savedOrder.getOrderId());
                notificationService.createOrderNotification(savedOrder); // Gọi service mới
                log.info("Successfully triggered notification creation for Order ID: {}", savedOrder.getOrderId());
            } catch (Exception e) {
                // Log lỗi tạo thông báo nhưng KHÔNG rollback giao dịch tạo đơn hàng
                log.error("Failed to create notification for new order {}. Order creation itself was successful. Error: {}",
                        savedOrder.getOrderId(), e.getMessage(), e);
                // Có thể thêm logic gửi cảnh báo tới hệ thống giám sát ở đây
            }

            // Trả về Order đã lưu thành công
            return savedOrder;

        } catch (Exception e) {
            // Log lỗi chính xảy ra trong quá trình tạo đơn hàng
            log.error("Critical error during order creation process. Rolling back transaction. Error: {}", e.getMessage(), e);
            // Rethrow để kích hoạt rollback của @Transactional
            // Có thể bọc lại bằng một exception cụ thể hơn nếu muốn
            throw new RuntimeException("Error creating order: " + e.getMessage(), e);
        }
    }

    // --- Các phương thức khác giữ nguyên ---

    @Transactional(readOnly = true)
    public List<AdminOrderViewDTO> getOrdersByDateRangeAsDTO(LocalDateTime start, LocalDateTime end) {
        log.debug("Fetching orders between {} and {} for Admin View DTO", start, end);
        List<Order> orders = orderRepository.findOrdersByDateRange(start, end);
        log.info("Found {} orders in the specified date range", orders.size());
        return orders.stream().map(order -> {
            AdminOrderViewDTO dto = new AdminOrderViewDTO();
            dto.setOrderId(order.getOrderId());
            dto.setOrderDate(order.getOrderDate()); // Thêm ngày đặt hàng vào DTO
            dto.setTotalAmount(order.getTotalAmount());

            // Thông tin người nhận
            dto.setRecipientName(order.getRecipientName());
            dto.setRecipientPhone(order.getRecipientPhone());
            dto.setShippingAddress(order.getShippingAddress());

            // Lấy tên khách hàng nếu có
            if (order.getUser() != null) {
                dto.setCustomerName(order.getUser().getName());
            } else {
                dto.setCustomerName("Guest");
            }


            // Thông tin liên quan (cần @Transactional(readOnly = true))
            if (order.getStatus() != null) {
                dto.setStatusId(order.getStatus().getStatusId());
                dto.setStatusName(order.getStatus().getStatusName());
            }
            if (order.getPaymentMethod() != null) {
                dto.setPaymentMethodName(order.getPaymentMethod().getMethodName());
            }
            if (order.getChain() != null) {
                dto.setChainName(order.getChain().getName());
                dto.setChainLocation(order.getChain().getLocation());
            }

            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void updateOrderStatus(int orderId, int statusId) {
        log.info("Attempting to update order ID: {} to status ID: {}", orderId, statusId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    log.warn("Order not found with ID: {} for status update", orderId);
                    return new RuntimeException("Order not found with id: " + orderId);
                });
        OrderStatus status = orderStatusRepository.findById(statusId)
                .orElseThrow(() -> {
                    log.warn("OrderStatus not found with ID: {} for order update", statusId);
                    return new RuntimeException("OrderStatus not found with id: " + statusId);
                });
        order.setStatus(status);
        orderRepository.save(order);
        log.info("Successfully updated status for Order ID: {} to Status ID: {} ({})", orderId, statusId, status.getStatusName());

        // Cân nhắc: Có nên tạo thông báo cho khách hàng khi trạng thái đơn hàng thay đổi không?
        // Ví dụ: if (statusId == 2) { // Shipping
        //           notificationService.createOrderStatusUpdateNotification(order, "Your order #" + orderId + " is now shipping!");
        //        }
    }

    @Transactional(readOnly = true) // Nên thêm readOnly cho các phương thức chỉ đọc
    public List<Order> getAllOrders() {
        log.debug("Fetching all orders");
        return orderRepository.findAll(); // Cẩn thận với hiệu năng nếu có quá nhiều đơn hàng
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.debug("Fetching orders between {} and {}", startDate, endDate);
        return orderRepository.findOrdersByDateRange(startDate, endDate);
    }

    @Transactional(readOnly = true)
    public Optional<Order> findOrderById(int orderId) {
        log.debug("Fetching order by ID: {}", orderId);
        return orderRepository.findById(orderId);
    }
}