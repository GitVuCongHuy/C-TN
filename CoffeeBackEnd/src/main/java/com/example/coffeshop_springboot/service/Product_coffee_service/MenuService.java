package com.example.coffeshop_springboot.service.Product_coffee_service;

import com.example.coffeshop_springboot.dto.MenuRequest;
import com.example.coffeshop_springboot.entity.Chain_coffee_entity.Chain;
import com.example.coffeshop_springboot.entity.Product_coffee_entity.Menu;
import com.example.coffeshop_springboot.entity.Product_coffee_entity.Product;
import com.example.coffeshop_springboot.repository.Chain_coffee_repository.Chain_Repository;
import com.example.coffeshop_springboot.repository.Product_coffee_repository.MenuRepository;
import com.example.coffeshop_springboot.repository.Product_coffee_repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenuService {
    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private Chain_Repository chainRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Menu> getAllMenus() {
        return menuRepository.findAll();
    }

    public Menu saveMenu(MenuRequest menuRequest ) {

        Long chainId = Long.valueOf(menuRequest.getChainId());
        Chain chain = chainRepository.findByChainId(chainId)
                .orElseThrow(() -> new RuntimeException("Chain not found"));
        Product product = productRepository.findById(menuRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Menu menu = new Menu();
        menu.setChain(chain);
        menu.setProduct(product);
        return menuRepository.save(menu);
    }

    public Optional<Menu> getMenuById(int id) {
        return menuRepository.findById(id);
    }

    public void deleteMenu(int id) {
        menuRepository.deleteById(id);
    }
}
