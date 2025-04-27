package com.example.coffeshop_springboot.dto;

import java.math.BigDecimal;

public class ProductDTO {

    private Long chian_id;
    private String name;
    private String description;
    private BigDecimal price;
    private int stock;
    private String img;

    public Long getChian_id() {
        return chian_id;
    }

    public void setChian_id(Long chian_id) {
        this.chian_id = chian_id;
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
}
