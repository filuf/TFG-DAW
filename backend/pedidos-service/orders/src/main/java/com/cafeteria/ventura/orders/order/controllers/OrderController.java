package com.cafeteria.ventura.orders.order.controllers;

import com.cafeteria.ventura.orders.exceptions.CustomException;
import com.cafeteria.ventura.orders.order.dto.OrderDTO;
import com.cafeteria.ventura.orders.order.services.OrderService;
import lombok.AllArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/order")
@AllArgsConstructor
public class OrderController {

    private OrderService orderService;

    private final int NUMBER_OF_PAGES = 10;
    @GetMapping("/history")
    public ResponseEntity<Page<OrderDTO>> getOrderUserHistory(
            @RequestParam(defaultValue = "0") int page,
            @AuthenticationPrincipal UserDetails userDetails) throws CustomException {
        //ordena la paginación por los más recientes
        Pageable pageable = PageRequest.of(page, NUMBER_OF_PAGES, Sort.by("id").descending());
        Page<OrderDTO> orders = orderService.getOrdersByUsername(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(orders);
    }

}
