package com.cafeteria.ventura.orders.cart.dto;

import com.cafeteria.ventura.orders.cart.models.CartHasProductsEntity;
import com.cafeteria.ventura.orders.product.models.ProductEntity;
import lombok.Getter;


public class AddProductResponse extends ProductResponse{
    public AddProductResponse(CartHasProductsEntity cartHasProductsEntity) {
        super(cartHasProductsEntity);
    }
}
