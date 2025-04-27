package com.example.coffeshop_springboot.entity.Chain_coffee_entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "sales")
public class Sales {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sales_id")
    private Long salesId;

    @ManyToOne
    @JoinColumn(name = "chain_id",nullable = false)
    private Chain chain;


    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalRevenue;

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Chain getChain() {
        return chain;
    }

    public void setChain(Chain chain) {
        this.chain = chain;
    }

    public Long getId() {
        return salesId;
    }

    public void setId(Long id) {
        this.salesId = id;
    }
}
