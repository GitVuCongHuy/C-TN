package com.example.coffeshop_springboot.controller.Product_coffee_controller;


import com.example.coffeshop_springboot.dto.MenuRequest;
import com.example.coffeshop_springboot.entity.Product_coffee_entity.Menu;
import com.example.coffeshop_springboot.service.Product_coffee_service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/menu")
public class MenuController {
    @Autowired
    private MenuService menuService;

    @GetMapping
    public List<Menu> getAllMenus() {
        return menuService.getAllMenus();
    }

    @PostMapping
    public Menu createMenu(@RequestBody MenuRequest menu) {
        return menuService.saveMenu(menu);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Menu> getMenuById(@PathVariable int id) {
        return menuService.getMenuById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{id}")
    public void deleteMenu(@PathVariable int id) {
        menuService.deleteMenu(id);
    }
}
