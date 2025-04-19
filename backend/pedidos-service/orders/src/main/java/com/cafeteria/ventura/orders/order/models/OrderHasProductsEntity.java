package com.cafeteria.ventura.orders.order.models;

import com.cafeteria.ventura.orders.product.models.ProductEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "orders_has_product")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderHasProductsEntity {

    @EmbeddedId
    OrderHasProductsId id;

    @MapsId("orderId")
    @ManyToOne
    @JoinColumn(name = "id_order")
    private OrderEntity order;

    @MapsId("productId")
    @ManyToOne
    @JoinColumn(name = "id_product")
    private ProductEntity product;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;
}
