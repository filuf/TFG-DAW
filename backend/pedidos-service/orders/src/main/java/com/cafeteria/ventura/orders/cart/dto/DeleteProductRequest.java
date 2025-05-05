package com.cafeteria.ventura.orders.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;

@AllArgsConstructor
@Data
public class DeleteProductRequest {
    @NonNull
    private Long idProduct;
}
