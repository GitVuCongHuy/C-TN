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
import com.example.coffeshop_springboot.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.example.coffeshop_springboot.entity.User;
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
    private User_Repository userRepository;
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

    @Autowired
    private NotificationService notificationService;


    @Transactional
    public Order createOrder(OrderDTO orderDto, UserAuth authenticatedUserAuth) {
        Order savedOrder = null;
        try {
            log.debug("Finding related entities for new order");
            OrderStatus orderStatus = orderStatusRepository
                    .findByStatusId(1)
                    .orElseThrow(() -> new RuntimeException("Default OrderStatus (ID=1) not found."));

            PaymentMethod paymentMethod = paymentMethodRepository.findByPaymentMethodId(orderDto.getPayment_method_id());
            if (paymentMethod == null) {
                throw new RuntimeException("PaymentMethod not found for id: " + orderDto.getPayment_method_id());
            }


            Chain chain = chainRepository
                    .findByChainId(orderDto.getChain_id())
                    .orElseThrow(() -> new RuntimeException("Chain not found for id: " + orderDto.getChain_id()));

            log.debug("Creating new Order entity");
            Order orderEntity = new Order();
            orderEntity.setPaymentMethod(paymentMethod);
            orderEntity.setStatus(orderStatus);
            orderEntity.setChain(chain);
            orderEntity.setTotalAmount(orderDto.getTotalAmount());

            if (authenticatedUserAuth != null && authenticatedUserAuth.getUser() != null) {
                log.debug("Assigning authenticated user (ID: {}) to order", authenticatedUserAuth.getUser().getUserId());
                orderEntity.setUser(authenticatedUserAuth.getUser());
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
                orderEntity.setUser(null);
                orderEntity.setRecipientName(orderDto.getRecipientName());
                orderEntity.setRecipientEmail(orderDto.getRecipientEmail());
                orderEntity.setRecipientPhone(orderDto.getRecipientPhone());
                orderEntity.setShippingAddress(orderDto.getShippingAddress());
            }

            savedOrder = orderRepository.save(orderEntity);
            log.info("Saved Order with ID: {}", savedOrder.getOrderId());

            if (orderDto.getProduct() == null || orderDto.getProduct().isEmpty()) {
                log.error("Order creation failed for Order ID {}: Order must contain at least one product.", savedOrder.getOrderId());
                throw new IllegalArgumentException("Order must contain at least one product.");
            }

            List<Integer> productIds = orderDto.getProduct().stream()
                    .map(CartDTO::getProductId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList());

            log.debug("Fetching products with IDs: {}", productIds);
            List<Product> products = productRepository.findAllById(productIds);
            if (products.size() != productIds.size()) {
                log.error("Order creation failed for Order ID {}: Could not find all products for IDs: {}", savedOrder.getOrderId(), productIds);
                throw new RuntimeException("Could not find all products for the order.");
            }

            final Order finalSavedOrder = savedOrder; // Cần final để dùng trong lambda
            List<OrderProduct> orderProducts = orderDto.getProduct()
                    .stream()
                    .map(cartDTO -> {
                        Product product = products.stream()
                                .filter(p -> p.getProductId() == cartDTO.getProductId())
                                .findFirst()
                                .get();

                        OrderProduct orderProduct = new OrderProduct();
                        orderProduct.setProduct(product);
                        orderProduct.setQuantity(cartDTO.getQuantity());
                        orderProduct.setPrice(cartDTO.getPrice());
                        // orderProduct.setPrice(product.getPrice());
                        orderProduct.setOrder(finalSavedOrder);
                        return orderProduct;
                    })
                    .collect(Collectors.toList());

            orderProductRepository.saveAll(orderProducts);
            log.info("Saved {} OrderProduct items for Order ID: {}", orderProducts.size(), savedOrder.getOrderId());


            try {
                log.debug("Attempting to create ADMIN notification for Order ID: {}", savedOrder.getOrderId());
                // SỬA Ở ĐÂY: Gọi phương thức tạo thông báo admin cụ thể
                notificationService.createAdminNewOrderNotification(savedOrder);
                log.info("Successfully triggered ADMIN notification creation for Order ID: {}", savedOrder.getOrderId());
            } catch (Exception e) {
                log.error("Failed to create ADMIN notification for new order {}. Order creation itself was successful. Error: {}",
                        savedOrder.getOrderId(), e.getMessage(), e);
            }

            return savedOrder;

        } catch (Exception e) {
            log.error("Critical error during order creation process. Rolling back transaction. Error: {}", e.getMessage(), e);
            throw new RuntimeException("Error creating order: " + e.getMessage(), e);
        }
    }


    @Transactional(readOnly = true)
    public List<AdminOrderViewDTO> getOrdersByDateRangeAsDTO(LocalDateTime start, LocalDateTime end) {
        log.debug("Fetching orders between {} and {} for Admin View DTO", start, end);
        List<Order> orders = orderRepository.findOrdersByDateRange(start, end);
        log.info("Found {} orders in the specified date range", orders.size());
        return orders.stream().map(order -> {
            AdminOrderViewDTO dto = new AdminOrderViewDTO();
            dto.setOrderId(order.getOrderId());
            dto.setOrderDate(order.getOrderDate());
            dto.setTotalAmount(order.getTotalAmount());

            dto.setRecipientName(order.getRecipientName());
            dto.setRecipientPhone(order.getRecipientPhone());
            dto.setShippingAddress(order.getShippingAddress());

            if (order.getUser() != null) {
                dto.setCustomerName(order.getUser().getName());
            } else {
                dto.setCustomerName("Guest");
            }

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
    public boolean updateOrderStatus(int orderId, int statusId) { // Thay đổi kiểu trả về để biết có thành công không
        log.info("Attempting to update order ID: {} to status ID: {}", orderId, statusId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    log.warn("Order not found with ID: {} for status update", orderId);
                    return new RuntimeException("Order not found with id: " + orderId);
                });

        OrderStatus oldStatus = order.getStatus(); // Lấy trạng thái cũ
        String oldStatusName = (oldStatus != null) ? oldStatus.getStatusName() : null;

        OrderStatus newStatus = orderStatusRepository.findById(statusId)
                .orElseThrow(() -> {
                    log.warn("OrderStatus not found with ID: {} for order update", statusId);
                    return new RuntimeException("OrderStatus not found with id: " + statusId);
                });

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        log.info("Successfully updated status for Order ID: {} to Status ID: {} ({})", orderId, statusId, newStatus.getStatusName());

        if (updatedOrder.getUser() != null) {
            try {
                notificationService.createCustomerOrderStatusUpdateNotification(updatedOrder, oldStatusName, newStatus.getStatusName());
                log.info("Successfully triggered customer notification for order status update. Order ID: {}", orderId);
            } catch (Exception e) { // Bắt Exception chung
                log.error("Failed to create customer notification for order status update. Order ID: {}. Error: {}",
                        orderId, e.getMessage(), e);
                // KHÔNG re-throw lỗi này để không làm rollback việc cập nhật trạng thái đơn hàng
                // Tuy nhiên, điều này có thể là nguyên nhân gây ra lỗi 500 nếu có vấn đề trong notificationService
                // mà không được xử lý đúng cách ở đó.
            }
        }
        return true;
    }

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        log.debug("Fetching all orders");
        return orderRepository.findAll();
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