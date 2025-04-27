package com.example.coffeshop_springboot.controller.Chain_coffee_controller;

import com.example.coffeshop_springboot.dto.ChainDTO;
import com.example.coffeshop_springboot.entity.Chain_coffee_entity.Chain;
import com.example.coffeshop_springboot.entity.User;
import com.example.coffeshop_springboot.entity.UserAuth;
import com.example.coffeshop_springboot.repository.Chain_coffee_repository.Chain_Repository;
import com.example.coffeshop_springboot.repository.UserAuth_Repository;
import com.example.coffeshop_springboot.repository.User_Repository;
import com.example.coffeshop_springboot.service.Chain_coffee_service.Chain_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/chain")
public class Chain_Controller {

    @Autowired
    private Chain_Service chainService;

    @Autowired
    private User_Repository userRepository;

    @Autowired
    private UserAuth_Repository userAuthRepository;

    @Autowired
    private Chain_Repository chainRepository;

    @PostMapping("/create/{user_id}")
    public ResponseEntity<?> create_chain(@RequestBody Chain chain,@PathVariable Long user_id){
        try {
            Optional<User> user = userRepository.findByUserId(user_id);
            if (!user.isPresent()){
                return new ResponseEntity<>("Chưa Thêm Quản Lí", HttpStatus.BAD_REQUEST);
            }

            Chain new_chain = chainService.create_chain(chain,user.get());
            return new ResponseEntity<>(new_chain, HttpStatus.CREATED);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @PostMapping("/create_new/{name}")
    public ResponseEntity<?> create_new_chain(@RequestBody Chain chain,@PathVariable String name){
        try {
            Optional<UserAuth> userAuth = userAuthRepository.findByUsername(name);
            if (!userAuth.isPresent()){
                return new ResponseEntity<>("Tài Khoản Ko tồn Tại", HttpStatus.BAD_REQUEST);
            }

            Chain new_chain = chainService.create_chain(chain,userAuth.get().getUser());
            return new ResponseEntity<>(new_chain, HttpStatus.CREATED);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @PostMapping("/update")
    public ResponseEntity<?> update_chain(@RequestBody ChainDTO chain){
        try {
            Optional<User> user = userRepository.findByUserId(chain.getUserId());
            if (!user.isPresent()){
                return new ResponseEntity<>("không có tài khoản ",HttpStatus.BAD_REQUEST);
            }
           Chain chain1 = chainService.update_chain(chain,user.get());
           return new ResponseEntity<>(chain1,HttpStatus.OK);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @DeleteMapping("/delete/{chain_id}")
    public ResponseEntity<?> delete_Chain(@PathVariable Long chain_id){
        try {
            Optional<Chain> chain = chainRepository.findByChainId(chain_id);
            if (chain.isPresent()){
                chainRepository.delete(chain.get());
                return new ResponseEntity<>(HttpStatus.OK);
            }else {
                return new ResponseEntity<>("không có cỡ sở nào ",HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @PutMapping("/get_all")
    public ResponseEntity<?> get_all_chain (){
        try {
            List<Chain> chains = chainService.getAllChains();
            if (chains.isEmpty()) {
                return new ResponseEntity<>("Không có cơ sở nào.", HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(chains, HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
