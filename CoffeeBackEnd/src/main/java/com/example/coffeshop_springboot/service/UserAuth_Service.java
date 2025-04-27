package com.example.coffeshop_springboot.service;

import com.example.coffeshop_springboot.entity.Role;
import com.example.coffeshop_springboot.entity.User;
import com.example.coffeshop_springboot.entity.UserAuth;
import com.example.coffeshop_springboot.entity.UserRole;
import com.example.coffeshop_springboot.repository.Role_Repository;
import com.example.coffeshop_springboot.repository.UserAuth_Repository;
import com.example.coffeshop_springboot.repository.UserRole_Repository;
import com.example.coffeshop_springboot.repository.User_Repository;
import jakarta.transaction.Transactional;
import org.hibernate.sql.Update;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.util.List;
import java.util.Optional;

@Service
public class UserAuth_Service {
    @Autowired
    private UserAuth_Repository userAuthRepository;

    @Autowired
    private Role_Repository roleRepository;

    @Autowired
    private User_Service userService;

    @Autowired
    private User_Repository userRepository;

    @Autowired
    private EmailService emailService;
    @Autowired
    private Radom_Code_Service radomCodeService;

    @Autowired
    private UserRole_Repository userRoleRepository;



    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserAuth Register(UserAuth userAuth){
        try {
            // Tạo UserAuth mới từ thông tin trong userAuth
            UserAuth newUserAuth = new UserAuth();
            newUserAuth.setUsername(userAuth.getUsername());
            newUserAuth.setPassword(passwordEncoder.encode(userAuth.getPassword()));

            // Tạo một User mới
            User user = new User();
            user = userRepository.save(user);  // Lưu User trước để có user_id

            // Gán UserAuth cho User
            newUserAuth.setUser(user);  // Gán user cho userAuth

            // Lưu UserAuth vào cơ sở dữ liệu (sẽ tạo auth_id cho userAuth)
            UserAuth savedUserAuth = userAuthRepository.save(newUserAuth);

            userRepository.save(user);  // Cập nhật lại User với userAuth

            // Tạo và gán vai trò cho user
            Role customerRole = roleRepository.findByRoleName("CUSTOMER")
                    .orElseThrow(() -> new RuntimeException("Role 'CUSTOMER' not found"));

            UserRole userRole = new UserRole();
            userRole.setUser(user);  // Gán user cho UserRole
            userRole.setRole(customerRole);  // Gán vai trò CUSTOMER cho UserRole

            // Thêm UserRole vào danh sách userRoles của user
            user.getUserRoles().add(userRole);

            // Lưu lại User với danh sách UserRoles
            userRepository.save(user);

            return savedUserAuth;
        } catch (Exception e) {
            throw new RuntimeException("Error saving user", e);
        }

    }


    public UserAuth Login(UserAuth userAuth){
        try {
            Optional<UserAuth> userAuth1 = userAuthRepository.findByUsername(userAuth.getUsername());
            if(userAuth1.isPresent() && passwordEncoder.matches(userAuth.getPassword(),userAuth1.get().getPassword()) ){
                return userAuth1.get();
            }else {
                throw new RuntimeException("Invalid username or password.");
            }
        } catch (Exception e) {

            throw new RuntimeException("Error during login", e);
        }
    }

    public String get_password_by_mail(String email, String subjectEmail, String bodyEmail) {
        Optional<UserAuth> userAuthOptional = userAuthRepository.findByUserEmail(email);

        if (userAuthOptional.isPresent()) {
            UserAuth userAuth = userAuthOptional.get();

            // Tạo mã khôi phục (reset code)
            String resetCode =radomCodeService.generateRandomCode(6);
            String subject =   subjectEmail + userAuth.getUsername();
            // Tạo subject và body cho email

            String body = bodyEmail + "\nMã khôi phục của bạn là: " + resetCode;

            // Gửi email
            emailService.send_Email_Data(email, subject, body);

            return resetCode;
        } else {
            // Nếu không tìm thấy UserAuth cho email, ném ngoại lệ
            throw new RuntimeException("Không tìm thấy tài khoản với email: " + email);
        }
    }


    public String get_password_by_username(String username, String subjectEmail, String bodyEmail){
        try {
            Optional<UserAuth> userAuth = userAuthRepository.findByUsername(username);
            if (userAuth.isPresent()){
                UserAuth userAuth1 = userAuth.get();
                String resetCode = radomCodeService.generateRandomCode(7);
                String subject =   subjectEmail;
                String body = bodyEmail + "\nMã khôi phục của bạn là: " + resetCode;
                emailService.send_Email_Data(userAuth1.getUser().getEmail(), subject, body);
                return  resetCode;
            }else {
                throw new RuntimeException("Không tìm thấy tài khoản với tên:"+username);
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public UserAuth update_UserAuth(UserAuth userAuth){
        try {
            Optional<UserAuth> userAuth1 = userAuthRepository.findByUsername(userAuth.getUsername());
            if(userAuth1.isPresent()){

                userAuth1.get().setPassword(passwordEncoder.encode(userAuth.getPassword()));
                return userAuthRepository.save(userAuth1.get());

            } else {
                // Nếu không tìm thấy UserAuth cho email, ném ngoại lệ
                throw new RuntimeException("Không Thấy Tài Khoản ");
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    @Transactional
    public void  delete_UserAuth(Long id){
       try {
                    Optional<UserAuth> userAuth = userAuthRepository.findById(id);
                    if (userAuth.isPresent()) {
                        userAuthRepository.delete(userAuth.get());
                    } else {
                        throw new RuntimeException("User not found with id" + id);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
