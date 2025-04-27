package com.example.coffeshop_springboot.dto;

import java.math.BigDecimal;

public class CartDTO {
    private int productId;
    private String name;
    private String description;
    private BigDecimal price;
    private int stock;
    private String img;
    private int quantity;
    private boolean ckeck;

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public String getImg() {
        return img;
    }

    public void setImg(String img) {
        this.img = img;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public boolean isCkeck() {
        return ckeck;
    }

    public void setCkeck(boolean ckeck) {
        this.ckeck = ckeck;
    }
}
