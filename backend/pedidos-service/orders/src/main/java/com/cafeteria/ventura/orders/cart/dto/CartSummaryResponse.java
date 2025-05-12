package com.cafeteria.ventura.orders.cart.dto;

import com.cafeteria.ventura.orders.cart.models.CartHasProductsEntity;
import lombok.Data;

import java.util.List;

/**
 * Carrito mapeado para mostrar la lista de productos, el precio total y el precio total de productos ilimitados
 */
@Data
public class CartSummaryResponse {

    private List<ProductResponse> productList;
    private Float totalProductPrice;
    private Float totalUnlimitedProductPrice;
    public CartSummaryResponse(List<CartHasProductsEntity> allCartProducts) {
        this.productList = this.transformIntoProductResponse(allCartProducts);
        this.totalProductPrice = this.getAllProductPrice(allCartProducts);
        this.totalUnlimitedProductPrice = getAllUnlimitedProductPrice(allCartProducts);
    }

    private List<ProductResponse> transformIntoProductResponse(List<CartHasProductsEntity> allCartProducts) {
        return allCartProducts.stream()
                .map(ProductResponse::new)
                .toList();
    }

    private Float getAllProductPrice(List<CartHasProductsEntity> productList) {
        return productList.stream()
                .map( product -> product.getProduct().getProductPrice() * product.getQuantity() )
                .reduce(Float::sum)
                .map( price -> Math.round(price * 100f) / 100f) //redondeo a 2 decimales
                .orElse(0f);
    }

    private Float getAllUnlimitedProductPrice(List<CartHasProductsEntity> productList) {
        return productList.stream()
                .filter( product -> product.getProduct().getIsUnlimited())
                .map( product -> product.getProduct().getProductPrice() * product.getQuantity())
                .reduce(Float::sum)
                .map( price -> Math.round(price * 100f) / 100f) //redondeo a 2 decimales
                .orElse(0f);
    }
}
