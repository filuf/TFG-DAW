package com.cafeteria.ventura.orders.cart.models;

import com.cafeteria.ventura.orders.product.models.ProductEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cart_has_products")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartHasProductsEntity {

    @EmbeddedId
    private CartHasProductsId id;

    @MapsId("productId")
    @ManyToOne
    @JoinColumn(name = "id_product")
    private ProductEntity product;

    @MapsId("cartId")
    @ManyToOne
    @JoinColumn(name = "id_cart")
    private CartEntity cart;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;
}
