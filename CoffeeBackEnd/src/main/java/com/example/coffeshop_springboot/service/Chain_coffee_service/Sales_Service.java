package com.example.coffeshop_springboot.service.Chain_coffee_service;

import com.example.coffeshop_springboot.dto.SalesDTO;
import com.example.coffeshop_springboot.entity.Chain_coffee_entity.Chain;
import com.example.coffeshop_springboot.entity.Chain_coffee_entity.Sales;
import com.example.coffeshop_springboot.repository.Chain_coffee_repository.Chain_Repository;
import com.example.coffeshop_springboot.repository.Chain_coffee_repository.Sales_Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.swing.text.Style;
import java.util.Optional;

@Service
public class Sales_Service {
    @Autowired
    private Sales_Repository salesRepository;

    @Autowired
    private Chain_Repository chainRepository;

    public Sales create_Sales(SalesDTO salesDTO){
        try{
            Optional<Chain> chain = chainRepository.findByChainId(salesDTO.getChain_id());

            if(chain.isPresent()){
                Sales sales = new Sales();
                sales.setChain(chain.get());
                sales.setTotalRevenue(salesDTO.getTotalRevenue());
                return salesRepository.save(sales);
            }else {
                return null;
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public  Sales update_sales(SalesDTO salesDTO){
        try{

            Optional<Sales> sales = salesRepository.findBySalesId(salesDTO.getSales_id());
            if(sales.isPresent()){
                sales.get().setTotalRevenue(salesDTO.getTotalRevenue());

                return salesRepository.save(sales.get());
            }else {
                return null;
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
