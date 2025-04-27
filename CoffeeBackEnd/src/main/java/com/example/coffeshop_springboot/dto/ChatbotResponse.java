package com.example.coffeshop_springboot.dto;
import lombok.Data;
@Data
public class ChatbotResponse {
    public ChatbotResponse(String reply, String sessionId) {
        this.reply = reply;
        this.sessionId = sessionId;
    }

    public ChatbotResponse() {

    }

    public String getReply() {
        return reply;
    }

    public String getSessionId() {
        return sessionId;
    }

    private String reply;

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    private String sessionId;
}