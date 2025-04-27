package com.example.coffeshop_springboot.controller.Chain_coffee_controller;

import com.example.coffeshop_springboot.dto.SalesDTO;
import com.example.coffeshop_springboot.entity.Chain_coffee_entity.Sales;
import com.example.coffeshop_springboot.repository.Chain_coffee_repository.Sales_Repository;
import com.example.coffeshop_springboot.service.Chain_coffee_service.Sales_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/chain_sales")
public class Sales_Controller {

    @Autowired
    private Sales_Service salesService;
    @Autowired
    private Sales_Repository salesRepository;

    @PostMapping("/create")
    public ResponseEntity<?> create_sale(@RequestBody SalesDTO salesDTO){
        try {
            Sales sales = salesService.create_Sales(salesDTO);
            if (sales ==null){
                return  new ResponseEntity<>("Lỗi", HttpStatus.BAD_REQUEST);
            }
            return  new ResponseEntity<>(sales, HttpStatus.CREATED);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @DeleteMapping("/delete")
    public  ResponseEntity<?> delete_sales(@RequestBody SalesDTO salesDTO){
        try {
            System.out.println(salesDTO.getSales_id());
            Optional<Sales> sales = salesRepository.findBySalesId(salesDTO.getSales_id());
            if (sales.isPresent()){
                salesRepository.delete(sales.get());
                return new ResponseEntity<>(HttpStatus.OK);
            }else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @PutMapping("/update")
    public  ResponseEntity<?> update_sales(@RequestBody SalesDTO salesDTO){
        try {
            Sales sales = salesService.update_sales(salesDTO);
            if (sales==null){
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }else {
                return new ResponseEntity<>(sales,HttpStatus.OK);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
