package com.example.coffeshop_springboot.dto;

import com.example.coffeshop_springboot.entity.Order_coffee_entity.Order;
import java.math.BigDecimal;
import java.util.List;

public class Return_OderDto {

    private Integer orderId;
    private String userName;
    private BigDecimal totalAmount;
    private String statusName;
    private String paymentMethodName;

    private List<Cart_ReturnDTO> cartReturnDTOS;

    public Return_OderDto() {}

    public Return_OderDto(Order order, List<Cart_ReturnDTO> cartItems) {
        if (order != null) {
            this.orderId = order.getOrderId();
            this.totalAmount = order.getTotalAmount();

            if (order.getUser() != null) {
                this.userName = order.getUser().getName();
            } else {
                this.userName = "N/A";
            }

            if (order.getStatus() != null) {
                this.statusName = order.getStatus().getStatusName();
            } else {
                this.statusName = "N/A";
            }

            if (order.getPaymentMethod() != null) {
                this.paymentMethodName = order.getPaymentMethod().getMethodName();
            } else {
                this.paymentMethodName = "N/A";
            }
        }
        this.cartReturnDTOS = cartItems;
    }


    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatusName() {
        return statusName;
    }

    public void setStatusName(String statusName) {
        this.statusName = statusName;
    }

    public String getPaymentMethodName() {
        return paymentMethodName;
    }

    public void setPaymentMethodName(String paymentMethodName) {
        this.paymentMethodName = paymentMethodName;
    }

    public List<Cart_ReturnDTO> getCartReturnDTOS() {
        return cartReturnDTOS;
    }

    public void setCartReturnDTOS(List<Cart_ReturnDTO> cartReturnDTOS) {
        this.cartReturnDTOS = cartReturnDTOS;
    }
}