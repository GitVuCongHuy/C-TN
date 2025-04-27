package com.example.coffeshop_springboot.dto;
import lombok.Data;
@Data

public class ChatbotRequest {
    public String getMessage() {
        return message;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    private String message;
    private String sessionId;
}

