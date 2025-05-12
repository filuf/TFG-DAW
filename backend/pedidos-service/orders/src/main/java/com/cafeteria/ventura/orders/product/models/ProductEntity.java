package com.cafeteria.ventura.orders.product.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "products")
public class ProductEntity {

    @Column(name = "id_product")
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProduct;

    @Column(name = "product_name", length = 45, nullable = false)
    private String productName;

    @Column(name = "product_price", nullable = false)
    private Float productPrice;

    @Column(name = "is_unlimited", nullable = false)
    private Boolean isUnlimited;

    @Column(name = "url_image", nullable = false)
    private String urlImage;
}
