package com.cafeteria.ventura.orders.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class OrderDTO {
    private Long id;
    private String description;
    private boolean isPaid;
    private List<OrderProductDTO> products;
}
