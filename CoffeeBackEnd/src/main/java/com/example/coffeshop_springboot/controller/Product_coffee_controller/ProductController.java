package com.example.coffeshop_springboot.controller.Product_coffee_controller;

import com.example.coffeshop_springboot.dto.ProductDTO;
import com.example.coffeshop_springboot.entity.Order_coffee_entity.Order;
import com.example.coffeshop_springboot.entity.Product_coffee_entity.Product;
import com.example.coffeshop_springboot.repository.Order_coffee_repository.OrderProductRepository;
import com.example.coffeshop_springboot.service.Product_coffee_service.ProductService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional; // Thêm import Optional nếu dùng trong update

@RestController
@RequestMapping("/product")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderProductRepository orderProductRepository;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @PostMapping("/new")
    public Product create_new_Product(@RequestBody ProductDTO productDTO) {
        try{
            return productService.Create_product(productDTO);
        } catch (Exception e) {
            throw new RuntimeException("Error creating product: " + e.getMessage(), e);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable int id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable int id, @RequestBody Product productDetails) {
        Optional<Product> updatedProductOptional = productService.updateProduct(id, productDetails);
        return updatedProductOptional
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteProduct(@PathVariable int id) {
        try {
            if (!productService.getProductById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            orderProductRepository.deleteByProduct_ProductId(id);
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}