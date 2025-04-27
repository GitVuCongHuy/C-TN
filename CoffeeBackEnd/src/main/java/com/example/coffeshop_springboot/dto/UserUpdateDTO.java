package com.example.coffeshop_springboot.dto;

public class UserUpdateDTO {
    private String name;
    private String email;
    private String phone_number;
    private String address;
    private String img;

    public UserUpdateDTO() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone_number() { return phone_number; }
    public void setPhone_number(String phone_number) { this.phone_number = phone_number; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getImg() { return img; }
    public void setImg(String img) { this.img = img; }

    @Override
    public String toString() {
        return "UserUpdateDTO{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", phone_number='" + phone_number + '\'' +
                ", address='" + address + '\'' +
                ", img='" + (img != null ? img.substring(0, Math.min(img.length(), 50)) + "..." : "null") + '\'' +
                '}';
    }
}