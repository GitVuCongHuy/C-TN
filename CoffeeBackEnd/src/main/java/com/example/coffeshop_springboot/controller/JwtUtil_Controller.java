package com.example.coffeshop_springboot.controller;


import com.example.coffeshop_springboot.entity.Token;
import com.example.coffeshop_springboot.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/token")
public class JwtUtil_Controller {
    @Autowired
    JwtUtil jwtUtil;

    @PostMapping("/check")
    public boolean check_token(@RequestBody Token token){
        try {
            return jwtUtil.isTokenValid(token);
        } catch (Exception ec) {
            throw new RuntimeException(ec);
        }
    }

}
