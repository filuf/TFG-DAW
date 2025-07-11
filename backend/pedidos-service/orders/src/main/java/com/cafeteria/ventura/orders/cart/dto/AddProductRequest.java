package com.cafeteria.ventura.orders.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;

@AllArgsConstructor
@Data
public class AddProductRequest {

    @NonNull
    private Long idProduct;

    @NonNull
    private Integer quantity;
}