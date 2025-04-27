package com.example.coffeshop_springboot.repository.Order_coffee_repository;

import com.example.coffeshop_springboot.entity.Order_coffee_entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Integer> {

    PaymentMethod findByPaymentMethodId(Integer paymentMethodId);

}
