package com.example.coffeshop_springboot.controller;


import com.example.coffeshop_springboot.entity.Token;
import com.example.coffeshop_springboot.entity.UserAuth;

import com.example.coffeshop_springboot.service.UserAuth_Service;
import com.example.coffeshop_springboot.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserAuth_Controller {
    @Autowired
    private UserAuth_Service userAuthService;

    @Autowired
    private JwtUtil jwtUtil;



    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserAuth userAuth) {
        // Kiểm tra nếu thiếu username hoặc password
        if (userAuth.getUsername() == null || userAuth.getPassword() == null) {
            return new ResponseEntity<>("Thiếu Tên Đăng Nhập hoặc Mật Khẩu", HttpStatus.BAD_REQUEST);
        }
        try {
            UserAuth userAuth1 = userAuthService.Register(userAuth);
            return new ResponseEntity<>(userAuth1, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Lỗi khi đăng ký người dùng", HttpStatus.INTERNAL_SERVER_ERROR);
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
