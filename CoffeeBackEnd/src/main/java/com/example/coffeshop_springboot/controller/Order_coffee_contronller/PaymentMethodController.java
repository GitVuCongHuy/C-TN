package com.example.coffeshop_springboot.controller.Order_coffee_contronller;

import com.example.coffeshop_springboot.entity.Order_coffee_entity.PaymentMethod;
import com.example.coffeshop_springboot.service.Order_coffee_service.PaymentMethodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/payment-methods")
public class PaymentMethodController {
    @Autowired
    private PaymentMethodService paymentMethodService;

    @GetMapping
    public ResponseEntity<List<PaymentMethod>> getAllPaymentMethods() {
        List<PaymentMethod> paymentMethods = paymentMethodService.getAllPaymentMethods();
        return new ResponseEntity<>(paymentMethods, HttpStatus.OK);
    }
}