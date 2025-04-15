package com.cafeteria.ventura.orders.cart.models;

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
public class CartHasProductsId implements Serializable {

    @Column(name = "id_product")
    private Long productId;

    @Column(name = "id_cart")
    private Long cartId;

}
