package com.example.coffeshop_springboot.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class PasswordResetRequestDTO {
 public String getEmail() {
     return email;
 }

 public void setEmail(String email) {
     this.email = email;
 }

 @NotBlank @Email private String email;
}
