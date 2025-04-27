package com.example.coffeshop_springboot.controller.Order_coffee_contronller;

import com.example.coffeshop_springboot.entity.Order_coffee_entity.OrderStatus;
import com.example.coffeshop_springboot.repository.Order_coffee_repository.OrderStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/status")
public class OrderStatusController {
    @Autowired
    private OrderStatusRepository orderStatusRepository;

    @GetMapping
    public List<OrderStatus> find_all(){
        return orderStatusRepository.findAll();
    }
}
