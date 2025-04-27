package com.example.coffeshop_springboot.controller;

import com.example.coffeshop_springboot.dto.ChatbotRequest;
import com.example.coffeshop_springboot.dto.ChatbotResponse;
import com.example.coffeshop_springboot.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot") // Endpoint chung cho chatbot
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<ChatbotResponse> handleMessage(@RequestBody ChatbotRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatbotResponse("Message cannot be empty.", request.getSessionId()));
        }

        // Gọi service để xử lý và lấy phản hồi từ Dialogflow
        String reply = chatbotService.detectIntent(request.getMessage(), request.getSessionId());

        // Tạo response trả về cho frontend
        ChatbotResponse response = new ChatbotResponse();
        response.setReply(reply);
        response.setSessionId(request.getSessionId()); // Trả lại sessionId để frontend dùng tiếp

        return ResponseEntity.ok(response);
    }
}