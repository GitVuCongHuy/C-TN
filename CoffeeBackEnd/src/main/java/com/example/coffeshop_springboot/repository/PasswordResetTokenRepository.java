package com.example.coffeshop_springboot.repository;

import com.example.coffeshop_springboot.entity.PasswordResetToken;
import com.example.coffeshop_springboot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByUser(User user);

    void deleteByUser(User user); // Xóa token cũ nếu user yêu cầu reset lại

    @Modifying // Cần thiết cho các câu lệnh UPDATE/DELETE tùy chỉnh
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiryDate <= CURRENT_TIMESTAMP")
    void deleteAllExpiredSince();
}