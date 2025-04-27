package com.example.coffeshop_springboot.entity.Staff_coffee_enity;

import com.example.coffeshop_springboot.entity.Chain_coffee_entity.Chain;
import com.example.coffeshop_springboot.entity.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "employee_performance")
public class EmployeePerformance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "performance_id")
    private int performanceId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "chain_id", nullable = false)
    private Chain chain;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "revenue", nullable = false)
    private BigDecimal revenue;

    @Column(name = "kpi_score")
    private BigDecimal kpiScore;

    @Column(name = "bonus")
    private BigDecimal bonus;
}
