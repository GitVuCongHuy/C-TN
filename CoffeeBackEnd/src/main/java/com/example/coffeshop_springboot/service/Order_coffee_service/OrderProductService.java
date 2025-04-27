package com.example.coffeshop_springboot.service.Order_coffee_service;

import com.example.coffeshop_springboot.dto.Cart_ReturnDTO;
import com.example.coffeshop_springboot.dto.Return_OderDto;
import com.example.coffeshop_springboot.entity.Order_coffee_entity.Order;
import com.example.coffeshop_springboot.entity.Order_coffee_entity.OrderProduct;
import com.example.coffeshop_springboot.entity.Product_coffee_entity.Product;
import com.example.coffeshop_springboot.repository.Order_coffee_repository.OrderProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderProductService {
    @Autowired
    private OrderProductRepository orderProductRepository;

    public List<OrderProduct> getOrderProductsByOrderId(Integer orderId) {
        return orderProductRepository.findByOrder_OrderId(orderId);
    }
    @Transactional(readOnly = true)
    public List<Return_OderDto> getOrderProductsByUserId(Long userId) {
        List<OrderProduct> orderProducts = orderProductRepository.findByOrderUserUserId(userId);

        Map<Integer, Return_OderDto> orderMap = new LinkedHashMap<>();

        for (OrderProduct orderProduct : orderProducts) {
            Order order = orderProduct.getOrder();
            Product product = orderProduct.getProduct();

            if (!orderMap.containsKey(order.getOrderId())) {
                Return_OderDto returnOderDto = new Return_OderDto(order, new ArrayList<>());
                orderMap.put(order.getOrderId(), returnOderDto);
            }
            Cart_ReturnDTO cartReturnDTO = new Cart_ReturnDTO(
                    product != null ? product.getProductId() : null, // Lấy ID sản phẩm
                    product != null ? product.getName() : "N/A",     // Lấy tên sản phẩm
                    product != null ? product.getImg() : null,       // Lấy ảnh sản phẩm
                    orderProduct.getQuantity(),                       // Số lượng từ OrderProduct
                    orderProduct.getPrice()                           // Giá từ OrderProduct
            );

            orderMap.get(order.getOrderId()).getCartReturnDTOS().add(cartReturnDTO);
        }

        return new ArrayList<>(orderMap.values());
    }
    @Transactional(readOnly = true)
    public List<Return_OderDto> get_all_oder_product(){
        List<OrderProduct> orderProducts = orderProductRepository.findAll();
        Map<Integer, Return_OderDto> orderMap = new LinkedHashMap<>();

        for (OrderProduct orderProduct : orderProducts) {
            Order order = orderProduct.getOrder();
            Product product = orderProduct.getProduct();

            if (!orderMap.containsKey(order.getOrderId())) {
                // Kích hoạt lazy loading cần thiết khi tạo DTO
                Return_OderDto returnOderDto = new Return_OderDto(order, new ArrayList<>());
                orderMap.put(order.getOrderId(), returnOderDto);
            }
            Cart_ReturnDTO cartReturnDTO = new Cart_ReturnDTO(
                    product != null ? product.getProductId() : null,
                    product != null ? product.getName() : "N/A",
                    product != null ? product.getImg() : null,
                    orderProduct.getQuantity(),
                    orderProduct.getPrice()
            );

            orderMap.get(order.getOrderId()).getCartReturnDTOS().add(cartReturnDTO);
        }
        return new ArrayList<>(orderMap.values());
    }
}