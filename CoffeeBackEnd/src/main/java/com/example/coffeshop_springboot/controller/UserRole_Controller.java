package com.example.coffeshop_springboot.controller;


import com.example.coffeshop_springboot.entity.UserRole;
import com.example.coffeshop_springboot.service.UserRole_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user_role")
public class UserRole_Controller {

    @Autowired
    private UserRole_Service userRoleService;

    @PutMapping("/search/{id}")
    public ResponseEntity<?> user_role_search(@PathVariable Long id ){
        try {
            return new ResponseEntity<>(userRoleService.find_role_by_user_id(id), HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }
        @PostMapping("/add_role/{id}")
        public ResponseEntity<?> add_role(@PathVariable Long id,@RequestBody Map<String,String> request){
            try{
                String Role_Name = request.get("Role_Name");
                List<UserRole> userRoles = userRoleService.Add_Role(id,Role_Name);
                return new ResponseEntity<>(userRoles,HttpStatus.OK);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        @DeleteMapping("/delete_role/{id}")
        public ResponseEntity<?> delete_role(@PathVariable Long id,@RequestBody Map<String,String> request){
            try {
                String Role_Name = request.get("Role_Name");
                if (Role_Name.equals("CUSTOMER")){
                    return new ResponseEntity<>("Không Thể Xóa CUSTOMER",HttpStatus.OK);
                }
                userRoleService.Delete_role(id,Role_Name);
                return new ResponseEntity<>(HttpStatus.OK);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
}
