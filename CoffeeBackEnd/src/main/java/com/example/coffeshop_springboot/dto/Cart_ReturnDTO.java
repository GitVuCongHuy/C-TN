package com.example.coffeshop_springboot.dto;

import com.example.coffeshop_springboot.entity.Product_coffee_entity.Product;

import java.math.BigDecimal;

public class Cart_ReturnDTO {
    private BigDecimal price;
    private int quantity;
    private Integer productId;
    private String productName;
    private String productImg;

    public Cart_ReturnDTO() {}

    public Cart_ReturnDTO(Integer productId, String productName, String productImg, int quantity, BigDecimal price) {
        this.productId = productId;
        this.productName = productName;
        this.productImg = productImg;
        this.quantity = quantity;
        this.price = price;
    }
    public Integer getProductId() { return productId; }
    public void setProductId(Integer productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductImg() { return productImg; }
    public void setProductImg(String productImg) { this.productImg = productImg; }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

}
