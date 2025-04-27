package com.example.coffeshop_springboot.dto;



public class ChainDTO {


    private Long chainId;
    private String name;
    private String location;
    private String contactInfo;
    private Long userId;
    private String img;








    public Long getChainId() {
        return chainId;
    }

    public void setChainId(Long chainId) {
        this.chainId = chainId;
    }
    public String getImg() {
        return img;
    }

    public void setImg(String img) {
        this.img = img;
    }



    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getContactInfo() {
        return contactInfo;
    }

    public void setContactInfo(String contactInfo) {
        this.contactInfo = contactInfo;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
