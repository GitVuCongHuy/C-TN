package com.example.coffeshop_springboot.controller.Order_coffee_contronller;

import com.example.coffeshop_springboot.dto.Return_OderDto;
import com.example.coffeshop_springboot.entity.Order_coffee_entity.OrderProduct;
import com.example.coffeshop_springboot.entity.UserAuth;
import com.example.coffeshop_springboot.repository.UserAuth_Repository;
import com.example.coffeshop_springboot.service.Order_coffee_service.OrderProductService;
import com.example.coffeshop_springboot.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/order_products")
public class OrderProductController {
    @Autowired
    private OrderProductService orderProductService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserAuth_Repository userAuthRepository;

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderProduct>> getOrderProductsByOrderId(@PathVariable Integer orderId) {
        List<OrderProduct> orderProducts = orderProductService.getOrderProductsByOrderId(orderId);
        return new ResponseEntity<>(orderProducts, HttpStatus.OK);
    }
    @GetMapping("/user")
    public ResponseEntity<List<Return_OderDto>> getOrderProductsByUserId(@RequestHeader("Authorization") String token) {
        String jwtToken = token.replace("Bearer ", "");
        UserAuth userAuth_token = jwtUtil.extractUserAuth(jwtToken);
        UserAuth userAuth = userAuthRepository.findByAuth_id(userAuth_token.getAuth_id()).get();
        List<Return_OderDto> orderProducts = orderProductService.getOrderProductsByUserId(userAuth.getUser().getUserId());

        return new ResponseEntity<>(orderProducts, HttpStatus.OK);
    }
    @GetMapping("/order_all")
    public ResponseEntity<List<Return_OderDto>> getallOrderProducts() {
        List<Return_OderDto> orderProducts = orderProductService.get_all_oder_product();
        return new ResponseEntity<>(orderProducts, HttpStatus.OK);
    }
}
