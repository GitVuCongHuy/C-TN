    package com.example.coffeshop_springboot.util;

    import com.example.coffeshop_springboot.entity.Token;
    import com.example.coffeshop_springboot.entity.UserAuth;


    import com.fasterxml.jackson.databind.ObjectMapper;
    import com.fasterxml.jackson.databind.SerializationFeature;
    import io.jsonwebtoken.Claims;
    import io.jsonwebtoken.Jwts;

    import io.jsonwebtoken.security.Keys;
    import org.springframework.stereotype.Component;

    import javax.crypto.SecretKey;
    import java.util.Date;
    import java.util.HashMap;
    import java.util.Map;

    @Component
    public class JwtUtil {
        private static final String SECRET_KEY = "coffeShop1234coffeShop1234coffeShop1234coffeShop1234"; // Khoá bí mật đủ dài (256 bits)
        private final ObjectMapper objectMapper = new ObjectMapper(); // Dùng để chuyển đổi JSON

        public JwtUtil() {
            // Disable serialization of empty beans to prevent issues with Hibernate lazy-loaded proxies
            objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        }
        // Tạo JWT token
        public Token generateToken(UserAuth userAuth) {
            try {
                // Use the SECRET_KEY to create the SecretKey object (256-bit key)
                SecretKey secretKey = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

                // Tạo một bản đồ để lưu trữ các trường cần thiết
                Map<String, Object> claims = new HashMap<>();
                claims.put("auth_id", userAuth.getAuth_id());
                claims.put("username", userAuth.getUsername());

                Token token = new Token();
                token.setToken(Jwts.builder()
                        .setClaims(claims)  // Đặt các claims (auth_id và username)
                        .setSubject(userAuth.getUsername())  // Username là subject
                        .setIssuedAt(new Date(System.currentTimeMillis()))  // Thời gian cấp token
                        .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))  // Thời gian hết hạn (10 giờ)
                        .signWith(secretKey)  // Ký token với khóa bí mật an toàn
                        .compact());
                // Tạo token
                return token;  // Sinh token
            } catch (Exception e) {
                throw new RuntimeException("Error generating token", e);
            }
        }

        // Trích xuất UserAuth từ token
        public UserAuth extractUserAuth(String token) {
            try {
                // Use the SECRET_KEY to parse the token (256-bit key)
                SecretKey secretKey = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

                // Parse the token and extract the claims
                Map<String, Object> claims = Jwts.parserBuilder()
                        .setSigningKey(secretKey) // Use the same SECRET_KEY for verification
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                // Retrieve the auth_id and username from the claims
                Object authIdObject = claims.get("auth_id");
                Long authId = (authIdObject instanceof Number) ? ((Number) authIdObject).longValue() : null; // Safe type casting
                String username = (String) claims.get("username");

                // Create a new UserAuth object with the extracted values
                UserAuth userAuth = new UserAuth();
                userAuth.setAuth_id(authId);
                userAuth.setUsername(username);

                return userAuth;
            } catch (Exception e) {
                throw new RuntimeException("Error extracting UserAuth from token", e);
            }
        }

        public boolean isTokenValid(Token token1) {
            try {
                String token = token1.getToken();

                // Tạo khóa bí mật để xác thực token
                SecretKey secretKey = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

                // Parse và kiểm tra chữ ký token
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(secretKey) // Sử dụng SECRET_KEY để xác minh
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                // Kiểm tra thời gian hết hạn
                Date expirationDate = claims.getExpiration();
                return expirationDate != null && expirationDate.after(new Date());
            } catch (Exception e) {
                // Nếu có lỗi khi parse token, xem như token không hợp lệ
                return false;
            }
        }
    }
