package com.example.coffeshop_springboot.service;

import com.example.coffeshop_springboot.entity.Role;
import com.example.coffeshop_springboot.entity.User;
import com.example.coffeshop_springboot.entity.UserAuth;
import com.example.coffeshop_springboot.entity.UserRole;
import com.example.coffeshop_springboot.repository.*;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.coffeshop_springboot.dto.RegisterRequestDTO;
import com.example.coffeshop_springboot.entity.PasswordResetToken;
import com.example.coffeshop_springboot.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import java.util.Optional;
import java.util.UUID;
@Service
public class UserAuth_Service {

    private static final Logger logger = LoggerFactory.getLogger(UserAuth_Service.class);

    @Autowired
    private UserAuth_Repository userAuthRepository;

    @Autowired
    private Role_Repository roleRepository;


    @Autowired
    private User_Repository userRepository;

    @Autowired
    private EmailService emailService;
    @Autowired
    private Radom_Code_Service radomCodeService;

    @Autowired
    private UserRole_Repository userRoleRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Value("${app.frontend.url}") // Ví dụ: app.frontend.url=http://localhost:3000
    private String frontendUrl;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public void createPasswordResetTokenForUser(String userEmail) {
        Optional<User> userOptional = userRepository.findByEmail(userEmail);
        if (!userOptional.isPresent()) {
            // Không ném lỗi trực tiếp ra ngoài để tránh lộ email nào tồn tại.
            // Ghi log nội bộ và trả về mà không làm gì cả.
            // logger.warn("Password reset requested for non-existent email: {}", userEmail);
            System.out.println("Request to reset password for non-existent email: " + userEmail);
            return; // Frontend sẽ luôn hiển thị thông báo chung chung
        }
        User user = userOptional.get();

        // Nếu user đã có token, xóa token cũ đi
        passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);


        String token = UUID.randomUUID().toString();
        PasswordResetToken myToken = new PasswordResetToken(token, user);
        passwordResetTokenRepository.save(myToken);

        // Gửi email
        String recipientAddress = user.getEmail();
        String subject = "Yêu cầu đặt lại mật khẩu";
        String confirmationUrl = frontendUrl + "/reset-password?token=" + token; // Đường dẫn trên frontend
        String messageBody = "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.\n\n"
                + "Vui lòng nhấp vào liên kết sau để đặt lại mật khẩu của bạn (liên kết sẽ hết hạn sau 24 giờ):\n"
                + confirmationUrl + "\n\n"
                + "Nếu bạn không yêu cầu thay đổi này, vui lòng bỏ qua email này.";

        try {
            emailService.send_Email_Data(recipientAddress, subject, messageBody); // Giả sử hàm này vẫn dùng được
        } catch (Exception e) {
            // logger.error("Failed to send password reset email to {}: {}", recipientAddress, e.getMessage(), e);
            // Có thể throw một lỗi nội bộ để admin biết, nhưng không nên để lộ ra client
            throw new RuntimeException("Could not send password reset email. Please try again later.");
        }
    }

    // Phương thức 2: Xác thực token
    public Optional<User> validatePasswordResetToken(String tokenValue) { // Đổi tên tham số cho rõ ràng
        logger.debug("Validating password reset token: {}", tokenValue);
        Optional<PasswordResetToken> passTokenOpt = passwordResetTokenRepository.findByToken(tokenValue);

        if (!passTokenOpt.isPresent()) {
            logger.warn("Token not found in DB: {}", tokenValue);
            return Optional.empty(); // Token không tồn tại
        }

        PasswordResetToken passToken = passTokenOpt.get();
        if (passToken.isExpired()) {
            logger.warn("Token {} for user {} has expired. Deleting token.", tokenValue, passToken.getUser().getUserId());
            passwordResetTokenRepository.delete(passToken); // Xóa token hết hạn
            return Optional.empty(); // Token đã hết hạn
        }

        logger.info("Token {} is valid for user {}", tokenValue, passToken.getUser().getUserId());
        return Optional.of(passToken.getUser());
    }

    // Phương thức 3: Thay đổi mật khẩu người dùng sau khi token hợp lệ
    @Transactional
    public void changeUserPassword(User user, String newPassword) {
        logger.info("Attempting to change password for user ID: {}", user.getUserId());
        Optional<UserAuth> userAuthOpt = userAuthRepository.findByUser(user);

        if (!userAuthOpt.isPresent()) {
            logger.error("CRITICAL: UserAuth record not found for user {} during password change.", user.getUserId());
            throw new RuntimeException("User authentication details not found. Cannot change password.");
        }

        UserAuth userAuth = userAuthOpt.get();
        userAuth.setPassword(passwordEncoder.encode(newPassword));
        userAuthRepository.save(userAuth);
        logger.info("Password changed successfully for user ID: {}", user.getUserId());

        // Sau khi đổi pass thành công, xóa token đã sử dụng
        // Token nên được xóa dựa trên User object, vì token string có thể đã được xóa nếu người dùng thử nhiều lần
        // Hoặc tốt hơn là xóa dựa trên đối tượng PasswordResetToken đã được validate trước đó.
        // Tuy nhiên, logic hiện tại là validate token, lấy user, rồi đổi pass, rồi xóa token của user đó.
        // Điều này ổn nếu đảm bảo validatePasswordResetToken không xóa token khi nó còn hợp lệ.
        Optional<PasswordResetToken> tokenToDelete = passwordResetTokenRepository.findByUser(user);
        if (tokenToDelete.isPresent()) {
            logger.info("Deleting password reset token for user ID: {} after successful password change. Token: {}", user.getUserId(), tokenToDelete.get().getToken());
            passwordResetTokenRepository.delete(tokenToDelete.get());
        } else {
            logger.warn("Could not find token to delete for user ID: {} after password change. It might have been deleted by expiration or another process.", user.getUserId());
        }
    }

    // (Tùy chọn) Dọn dẹp token hết hạn định kỳ
    @Scheduled(cron = "${jobs.purgeExpiredTokens.cron:0 0 1 * * ?}") // Mặc định chạy vào 1 giờ sáng hàng ngày
    @Transactional
    public void purgeExpiredTokens() {
        // logger.info("Purging expired password reset tokens.");
        System.out.println("Purging expired password reset tokens.");
        passwordResetTokenRepository.deleteAllExpiredSince();
    }


    @Transactional // Đảm bảo tất cả hoặc không gì cả
    public UserAuth Register(RegisterRequestDTO registerRequest) {
        // 1. Kiểm tra Username tồn tại trong UserAuth
        if (userAuthRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Error: Username '" + registerRequest.getUsername() + "' is already taken!");
        }

        // 2. Kiểm tra Email tồn tại trong User
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Error: Email '" + registerRequest.getEmail() + "' is already in use!");
        }

        try {
            // 3. Tạo User và lưu email
            User user = new User();
            user.setEmail(registerRequest.getEmail());
            user.setName(registerRequest.getUsername()); // Có thể dùng username làm tên ban đầu
            user.setUser_type("Customer"); // Gán loại user mặc định, đảm bảo cột user_type cho phép giá trị này
            User savedUser = userRepository.save(user); // Lưu user trước để lấy ID

            // 4. Tạo UserAuth
            UserAuth newUserAuth = new UserAuth();
            newUserAuth.setUsername(registerRequest.getUsername());
            newUserAuth.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            newUserAuth.setUser(savedUser); // Liên kết với User vừa tạo
            newUserAuth.setActive(true); // Kích hoạt tài khoản
            UserAuth savedUserAuth = userAuthRepository.save(newUserAuth);

            // 5. Gán Role 'Customer'
            // Đảm bảo tên Role là "Customer" trong database và Role_Repository có findByRoleName
            Role customerRole = roleRepository.findByRoleName("Customer")
                    .orElseThrow(() -> new RuntimeException("Error: Role 'Customer' not found. Please ensure it exists in the 'role' table."));

            UserRole userRole = new UserRole();
            userRole.setUser(savedUser);
            userRole.setRole(customerRole);
            userRoleRepository.save(userRole);

            return savedUserAuth;
        } catch (Exception e) {
            // Nên log lỗi ở đây
            // logger.error("Error during user registration for username {}: {}", registerRequest.getUsername(), e.getMessage(), e);
            throw new RuntimeException("Error registering user: " + e.getMessage(), e);
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

            String resetCode =radomCodeService.generateRandomCode(6);
            String subject =   subjectEmail + userAuth.getUsername();

            String body = bodyEmail + "\nMã khôi phục của bạn là: " + resetCode;

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

    public void validateCodeAndResetPassword(String email, String code, String newPassword) {
    }
}
