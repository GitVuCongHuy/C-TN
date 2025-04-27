package com.example.coffeshop_springboot.repository;


import com.example.coffeshop_springboot.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    Optional<Notification> findFirstByOrderOrderIdAndIsReadFalseOrderByCreatedAtDesc(Integer orderId);
    List<Notification> findByTargetRoleInAndIsReadFalseOrderByCreatedAtDesc(List<String> roles);

}