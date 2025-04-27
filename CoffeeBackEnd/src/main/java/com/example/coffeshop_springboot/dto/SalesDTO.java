package com.example.coffeshop_springboot.dto;

import java.math.BigDecimal;

public class SalesDTO {


    private Long Sales_id;
    private Long chain_id;
    private BigDecimal totalRevenue;


    public Long getSales_id() {
        return Sales_id;
    }

    public void setSales_id(Long sales_id) {
        Sales_id = sales_id;
    }

    public Long getChain_id() {
        return chain_id;
    }

    public void setChain_id(Long chain_id) {
        this.chain_id = chain_id;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

}