package com.example.coffeshop_springboot.controller;


import com.example.coffeshop_springboot.dto.PasswordResetDTO;
import com.example.coffeshop_springboot.dto.PasswordResetRequestDTO;
import com.example.coffeshop_springboot.dto.RegisterRequestDTO;
import com.example.coffeshop_springboot.dto.ResetPasswordWithCodeDTO;
import com.example.coffeshop_springboot.entity.Token;
import com.example.coffeshop_springboot.entity.User;
import com.example.coffeshop_springboot.entity.UserAuth;

import com.example.coffeshop_springboot.service.UserAuth_Service;
import com.example.coffeshop_springboot.util.JwtUtil;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UserAuth_Controller {
    private static final Logger logger = LoggerFactory.getLogger(UserAuth_Controller.class);

    @Autowired
    private UserAuth_Service userAuthService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/reset_password_with_code")
    public ResponseEntity<?> resetPasswordWithCode(@Valid @RequestBody ResetPasswordWithCodeDTO request) {
        try {
            // Gọi service để xác thực code và đổi mật khẩu
            userAuthService.validateCodeAndResetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
            return ResponseEntity.ok("Password has been reset successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping("/request_password_reset")
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody PasswordResetRequestDTO requestDTO) {
        try {
            userAuthService.createPasswordResetTokenForUser(requestDTO.getEmail());
            // Luôn trả về thông báo chung chung, ngay cả khi email không tồn tại, để bảo mật.
            return ResponseEntity.ok("If an account with that email exists, a password reset link has been sent.");
        } catch (Exception e) {
            // Log lỗi nghiêm trọng ở server
            // logger.error("Error processing password reset request for email {}: {}", requestDTO.getEmail(), e.getMessage(), e);
            // Vẫn trả về thông báo chung cho client để tránh lộ thông tin.
            return ResponseEntity.ok("If an account with that email exists, a password reset link has been sent.");
            // Hoặc có thể trả về lỗi 500 nếu đó là lỗi hệ thống không lường trước được
            // return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while processing your request.");
        }
    }

    // Endpoint 2: Người dùng submit mật khẩu mới sau khi click vào link trong email
    // (Frontend sẽ gọi endpoint này khi người dùng ở trang /reset-password?token=...)
    // UserAuth_Controller.java

    @PostMapping("/reset_password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetDTO resetDTO) {
        // ... (logging như trên)
        try {
            Optional<User> userOptional = userAuthService.validatePasswordResetToken(resetDTO.getToken());

            if (!userOptional.isPresent()) {
                logger.warn("Invalid or expired token received (Controller check): {}", resetDTO.getToken());
                // Trả về JSON
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired password reset token."));
            }

            User user = userOptional.get();
            userAuthService.changeUserPassword(user, resetDTO.getNewPassword());
            logger.info("Password reset successfully for user: {}", user.getEmail());
            // Trả về JSON
            return ResponseEntity.ok(Map.of("message", "Your password has been reset successfully."));

        } catch (RuntimeException e) {
            logger.error("Error resetting password for token {}: {}", resetDTO.getToken(), e.getMessage(), e);
            // Trả về JSON
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDTO registerRequest) { // Sử dụng DTO và @Valid
        // @Valid sẽ tự động kiểm tra các ràng buộc trong RegisterRequestDTO
        // Nếu không hợp lệ, Spring sẽ ném MethodArgumentNotValidException,
        // bạn có thể bắt bằng @ControllerAdvice để trả về lỗi đẹp hơn.

        try {
            UserAuth registeredUserAuth = userAuthService.Register(registerRequest);
            // Không nên trả về toàn bộ UserAuth object chứa mật khẩu đã hash.
            // Có thể trả về một DTO khác chỉ chứa username và id, hoặc chỉ một thông báo thành công.
            return new ResponseEntity<>("User registered successfully. Username: " + registeredUserAuth.getUsername(), HttpStatus.CREATED);
        } catch (RuntimeException e) { // Bắt RuntimeException cụ thể từ service
            // e.printStackTrace(); // Ghi log lỗi này ra console hoặc file log
            Map<String, String> errorResponse = Map.of("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST); // Trả về thông báo lỗi từ service
        } catch (Exception e) { // Bắt các lỗi không mong muốn khác
            // e.printStackTrace();
            return new ResponseEntity<>("An unexpected error occurred during registration.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserAuth userauth ) {
        try {
            UserAuth userAuth1 = userAuthService.Login(userauth);
            Token newtoken = jwtUtil.generateToken(userAuth1);

            return new ResponseEntity<>(newtoken, HttpStatus.ACCEPTED);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Sai Tên Tài Khoản Hoặc Mật Khẩu", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Lỗi hệ thống, vui lòng thử lại sau.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PostMapping("/forgot_password")
    public ResponseEntity<?> forgot_password(@RequestBody Map<String,String> request){
        try{
            String To_Email = request.get("Gmail");
            String Use_Name = request.get("UserName");

            if (To_Email==null){
                String Body = request.get("Body_Email");
                String Subject = request.get("Subject_Email");
                String ResetCode = userAuthService.get_password_by_username(Use_Name,Subject,Body);
                if (ResetCode!= null){
                    return new ResponseEntity<>(ResetCode,HttpStatus.OK);
                }else {
                    return new ResponseEntity<>("Không Tìm Thấy Tài Khoản Nào ",HttpStatus.BAD_REQUEST);
                }
            }else {
                String Body = request.get("Body_Email");
                String Subject = request.get("Subject_Email");
                String ResetCode = userAuthService.get_password_by_mail(To_Email,Subject,Body);
                if (ResetCode!= null){
                    return new ResponseEntity<>(ResetCode,HttpStatus.OK);
                }else {
                    return new ResponseEntity<>("Không Tìm Thấy Tài Khoản Nào ",HttpStatus.BAD_REQUEST);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @PostMapping("/update_UserAuth")
    public ResponseEntity<?> update_UserAuth(@RequestBody UserAuth userAuth){
        try {
            UserAuth userAuth1 =  userAuthService.update_UserAuth(userAuth);
            if (userAuth1!=null){
                return new ResponseEntity<>(userAuth1,HttpStatus.OK);
            }else {
                return new ResponseEntity<>("Không Tìm Thấy Tài Khoản Nào ",HttpStatus.OK);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @DeleteMapping("/delete/{id}")
    public  ResponseEntity<?> delete_UserAuth(@PathVariable Long id ,@RequestHeader("Authorization") String token){
        try {

            String jwtToken = token.replace("Bearer ", "");
            UserAuth userAuth_token = jwtUtil.extractUserAuth(jwtToken);
            if (userAuth_token.getAuth_id() == id){
                userAuthService.delete_UserAuth(id);
                return new ResponseEntity<>(HttpStatus.OK);
            }else {
                return new ResponseEntity<>("Bạn đéo có quyền xóa ",HttpStatus.OK);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
