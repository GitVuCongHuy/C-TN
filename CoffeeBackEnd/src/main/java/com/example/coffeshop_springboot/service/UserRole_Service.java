package com.example.coffeshop_springboot.service;

import com.example.coffeshop_springboot.entity.Role;
import com.example.coffeshop_springboot.entity.User;
import com.example.coffeshop_springboot.entity.UserRole;
import com.example.coffeshop_springboot.repository.Role_Repository;
import com.example.coffeshop_springboot.repository.UserRole_Repository;
import com.example.coffeshop_springboot.repository.User_Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserRole_Service {

    @Autowired
    public UserRole_Repository userRoleRepository;

    @Autowired
    private Role_Repository roleRepository;
    @Autowired
    private User_Repository userRepository;


    public List<UserRole> find_role_by_user_id(Long id){
        try {
            return  userRoleRepository.findByUser_UserId(id) ;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    public List<UserRole> Add_Role(Long user_id, String Role_Name) {
        try {
            // Lấy User và Role từ database
            User user = userRepository.findByUserId(user_id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Role role = roleRepository.findByRoleName(Role_Name)
                    .orElseThrow(() -> new RuntimeException("Role not found"));

            // Kiểm tra xem UserRole đã tồn tại chưa
            Optional<UserRole> existingUserRole = userRoleRepository.findByUserAndRole(user, role);

            if (existingUserRole.isPresent()) {
                throw new RuntimeException("This role is already assigned to the user");
            }

            // Nếu chưa tồn tại, thêm UserRole mới
            UserRole userRole = new UserRole();
            userRole.setUser(user);
            userRole.setRole(role);
            userRoleRepository.save(userRole);

            // Trả về danh sách các vai trò của user
            return find_role_by_user_id(user_id);

        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    public void Delete_role(Long user_id, String Role_Name){
        try {
            // Lấy User và Role từ database
            User user = userRepository.findByUserId(user_id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Role role = roleRepository.findByRoleName(Role_Name)
                    .orElseThrow(() -> new RuntimeException("Role not found"));

            Optional<UserRole> existingUserRole = userRoleRepository.findByUserAndRole(user, role);
            if (existingUserRole.isPresent()) {
                userRoleRepository.delete(existingUserRole.get());
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
