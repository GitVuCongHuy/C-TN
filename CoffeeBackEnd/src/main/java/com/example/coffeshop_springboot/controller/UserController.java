package com.example.coffeshop_springboot.controller;

import com.example.coffeshop_springboot.entity.User;
import com.example.coffeshop_springboot.entity.UserAuth;
import com.example.coffeshop_springboot.entity.UserRole;
import com.example.coffeshop_springboot.repository.UserAuth_Repository;
import com.example.coffeshop_springboot.service.UserRole_Service;
import com.example.coffeshop_springboot.service.User_Service;
import com.example.coffeshop_springboot.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.coffeshop_springboot.dto.UserUpdateDTO;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user_data")
public class UserController {
    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    @Autowired
    private User_Service userService;

    @Autowired
    private UserAuth_Repository userAuthRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRole_Service userRoleService;
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
        }
        Object principal = authentication.getPrincipal();
        User currentUser = null;

        if (principal instanceof UserAuth) {
            currentUser = ((UserAuth) principal).getUser();
        }
        else {
            log.warn("Principal is not of expected type to extract User entity: {}", principal.getClass().getName());
        }
        if (currentUser != null) {

            return ResponseEntity.ok(currentUser);
        } else {
            log.error("Could not retrieve User entity for authenticated principal.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User profile data not found.");
        }
    }
    @PutMapping("/update_user")
    public ResponseEntity<?> updateUserWithUrl(@RequestHeader("Authorization") String token, @RequestBody UserUpdateDTO userUpdateDTO) {
        log.info("Received update request for user via URL");
        log.debug("Token received: {}", token);
        log.debug("Payload received: {}", userUpdateDTO);
        try {
            String jwtToken = token.replace("Bearer ", "");
            UserAuth userAuth_token = jwtUtil.extractUserAuth(jwtToken);
            Optional<UserAuth> userAuthOpt = userAuthRepository.findByAuth_id(userAuth_token.getAuth_id());
            if (!userAuthOpt.isPresent()) {
                log.warn("User account not found for auth_id: {}", userAuth_token.getAuth_id());
                // Trả về thông báo tiếng Anh cho nhất quán
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User account not found.");
            }
            UserAuth userAuth = userAuthOpt.get();
            Long userId = userAuth.getUser().getUserId();
            User userToUpdate = new User();
            userToUpdate.setName(userUpdateDTO.getName());
            userToUpdate.setEmail(userUpdateDTO.getEmail());
            userToUpdate.setPhone_number(userUpdateDTO.getPhone_number());
            userToUpdate.setAddress(userUpdateDTO.getAddress());
            userToUpdate.setImg(userUpdateDTO.getImg());
            User updatedUser = userService.Update_User(userId, userToUpdate);
            log.info("Successfully updated user ID: {}", userId);
            return ResponseEntity.ok(updatedUser);

        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Error updating user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Internal server error during user update:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Server error during update: " + e.getMessage());
        }
    }
    @PostMapping("/get_user")
    public ResponseEntity<?> get_User(@RequestHeader("Authorization") String token) {
        try {
            String jwtToken = token.replace("Bearer ", "");
            UserAuth userAuth_token = jwtUtil.extractUserAuth(jwtToken);
            Optional<UserAuth> userAuth = userAuthRepository.findByAuth_id(userAuth_token.getAuth_id());
            if (!userAuth.isPresent()) {
                return new ResponseEntity<>("Tài Khoản Ko Tồn Tại", HttpStatus.BAD_REQUEST);
            }
            if (userAuth_token == null) {
                return new ResponseEntity<>("Missing userId", HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(userService.get_User(userAuth.get().getUser().getUserId()), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("ID Ko Hợp Lệ", HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/get_role")
    public List<UserRole> find_role(@RequestHeader("Authorization") String token) {
        try {
            String jwtToken = token.replace("Bearer ", "");
            UserAuth userAuth_token = jwtUtil.extractUserAuth(jwtToken);
            Optional<UserAuth> userAuth = userAuthRepository.findByAuth_id(userAuth_token.getAuth_id());
            return userRoleService.find_role_by_user_id(userAuth.get().getUser().getUserId());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}