package com.example.coffeshop_springboot.service.Order_coffee_service;

import com.example.coffeshop_springboot.entity.Order_coffee_entity.PaymentMethod;
import com.example.coffeshop_springboot.repository.Order_coffee_repository.PaymentMethodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentMethodService {
    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    public List<PaymentMethod> getAllPaymentMethods() {
        return paymentMethodRepository.findAll();
    }
}