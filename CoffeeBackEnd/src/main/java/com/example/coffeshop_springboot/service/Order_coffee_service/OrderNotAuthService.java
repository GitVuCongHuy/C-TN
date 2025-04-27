package com.example.coffeshop_springboot.service.Order_coffee_service;
import com.example.coffeshop_springboot.dto.ProductDTO;
import com.example.coffeshop_springboot.entity.Chain_coffee_entity.Chain;
import com.example.coffeshop_springboot.entity.Product_coffee_entity.Menu;
import com.example.coffeshop_springboot.entity.Product_coffee_entity.Product;
import com.example.coffeshop_springboot.repository.Chain_coffee_repository.Chain_Repository;
import com.example.coffeshop_springboot.repository.Product_coffee_repository.MenuRepository;
import com.example.coffeshop_springboot.repository.Product_coffee_repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Thêm import này nếu cần quản lý transaction rõ ràng hơn

import java.util.List;
import java.util.Optional;

public class OrderNotAuthService {

}
