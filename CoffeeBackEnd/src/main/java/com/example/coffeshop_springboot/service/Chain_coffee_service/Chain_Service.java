package com.example.coffeshop_springboot.service.Chain_coffee_service;

import com.example.coffeshop_springboot.dto.ChainDTO;
import com.example.coffeshop_springboot.entity.Chain_coffee_entity.Chain;
import com.example.coffeshop_springboot.entity.User;
import com.example.coffeshop_springboot.repository.Chain_coffee_repository.Chain_Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Chain_Service {

    @Autowired
    private Chain_Repository chainRepository;


    public Chain create_chain(Chain chain,User user){
        try{


            Chain chain1 = new Chain();
            chain1.setUser(user);
            chain1.setName(chain.getName());
            chain1.setLocation(chain.getLocation());
            chain1.setContact_info(chain.getContact_info());
            chain1.setImg(chain.getImg());



            return chainRepository.save(chain1);


        } catch (Exception e) {
            throw new RuntimeException(e);
        }


    }


    public Chain update_chain(ChainDTO chainDTO,User user){
        try{
            Optional<Chain> chain1 = chainRepository.findByChainId(chainDTO.getChainId());
            if (chain1.isPresent()){
                chain1.get().setLocation(chainDTO.getLocation());
                chain1.get().setName(chainDTO.getName());
                chain1.get().setContact_info(chainDTO.getContactInfo());
                chain1.get().setImg(chainDTO.getImg());
                chain1.get().setUser(user);
                chainRepository.save(chain1.get());
            }
            return chain1.get();

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }



    public List<Chain> getAllChains() {
        return chainRepository.findAll();
    }
}
