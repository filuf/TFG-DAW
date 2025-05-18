package com.cafeteria.ventura.orders.order.webhooks.nest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NestProductDetails {
    private String nombreProducto;
    private int cantidad;
}
