package com.cafeteria.ventura.orders.cart.dto;

import com.cafeteria.ventura.orders.cart.models.CartHasProductsEntity;
import com.cafeteria.ventura.orders.product.models.ProductEntity;
import lombok.Getter;

@Getter
public class ProductResponse {

    private ProductEntity product;
    private Integer quantity;

    public ProductResponse(CartHasProductsEntity cartHasProductsEntity) {
        this.product = cartHasProductsEntity.getProduct();
        this.quantity = cartHasProductsEntity.getQuantity();
    }
}
