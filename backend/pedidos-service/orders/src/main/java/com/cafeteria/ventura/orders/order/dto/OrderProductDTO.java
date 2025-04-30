package com.cafeteria.ventura.orders.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderProductDTO {
    private Long productId;
    private String name;
    private Float price;
    private String imageUrl;
    private Integer quantity;
}
