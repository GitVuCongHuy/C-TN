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
        private static final String SECRET_KEY = "coffeShop1234coffeShop1234coffeShop1234coffeShop1234";
        private final ObjectMapper objectMapper = new ObjectMapper();

        public JwtUtil() {
            objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        }

        public Token generateToken(UserAuth userAuth) {
            try {
                SecretKey secretKey = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

                Map<String, Object> claims = new HashMap<>();
                claims.put("auth_id", userAuth.getAuth_id());
                claims.put("username", userAuth.getUsername());

                Token token = new Token();
                token.setToken(Jwts.builder()
                        .setClaims(claims)
                        .setSubject(userAuth.getUsername())
                        .setIssuedAt(new Date(System.currentTimeMillis()))
                        .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
                        .signWith(secretKey)
                        .compact());

                return token;
            } catch (Exception e) {
                throw new RuntimeException("Error generating token", e);
            }
        }

        public UserAuth extractUserAuth(String token) {
            try {
                SecretKey secretKey = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

                Map<String, Object> claims = Jwts.parserBuilder()
                        .setSigningKey(secretKey)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                Object authIdObject = claims.get("auth_id");
                Long authId = (authIdObject instanceof Number) ? ((Number) authIdObject).longValue() : null;
                String username = (String) claims.get("username");

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

                SecretKey secretKey = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(secretKey)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                Date expirationDate = claims.getExpiration();
                return expirationDate != null && expirationDate.after(new Date());
            } catch (Exception e) {
                return false;
            }
        }
    }
