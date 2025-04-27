package com.example.coffeshop_springboot.service;

import com.example.coffeshop_springboot.entity.User;
import com.example.coffeshop_springboot.repository.User_Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class User_Service {
    @Autowired
    private User_Repository userRepository;

    //Tạo Bảng Dữ liệu user mới
    public User new_User(){
        try {
            User user = new User();
            return userRepository.save(user);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }

    public User get_User(Long user_id){
        try {
            Optional<User> user = userRepository.findByUserId(user_id);
            return  user.get();
        }catch (Exception e){
            throw new RuntimeException(e);
        }
    }

    public User get_User_Email(String email){

        try {

            return userRepository.findByEmail(email).get();

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    public User Update_User(Long id,User user) {
        try {
            Optional<User> user1 = userRepository.findByUserId(id);
            if (user1.isPresent()){
                User user2 = user1.get();
                user2.setAddress(user.getAddress());
                user2.setEmail(user.getEmail());
                user2.setName(user.getName());
                user2.setPhone_number(user.getPhone_number());
                user2.setImg(user.getImg());
                userRepository.save(user2);
                return user2;
            }else {
                throw new RuntimeException("Lỗi");
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }


}
