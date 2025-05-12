package com.cafeteria.ventura.orders.order.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@AllArgsConstructor
@NoArgsConstructor
@Data
public class OrderHasProductsId implements Serializable {

    @Column(name = "id_order")
    private Long orderId;

    @Column(name = "id_product")
    private Long productId;
}
