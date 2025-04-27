package com.example.coffeshop_springboot.entity.Staff_coffee_enity;


import com.example.coffeshop_springboot.entity.User;
import jakarta.persistence.*;

import java.security.Timestamp;

@Entity
@Table(name = "attendance")
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id")
    private int attendanceId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "check_in", nullable = false)
    private Timestamp checkIn;

    @Column(name = "check_out")
    private Timestamp checkOut;

    @Column(name = "skill_level", length = 50)
    private String skillLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_type", nullable = false)
    private WorkType workType;
}
