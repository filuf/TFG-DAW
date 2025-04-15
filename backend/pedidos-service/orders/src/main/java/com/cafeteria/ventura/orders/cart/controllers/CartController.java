package com.cafeteria.ventura.orders.cart.controllers;

import com.cafeteria.ventura.orders.cart.dto.AddProductRequest;
import com.cafeteria.ventura.orders.cart.dto.AddProductResponse;
import com.cafeteria.ventura.orders.cart.dto.CartSummaryResponse;
import com.cafeteria.ventura.orders.cart.models.CartHasProductsEntity;
import com.cafeteria.ventura.orders.cart.services.CartService;
import com.cafeteria.ventura.orders.exceptions.CustomException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
@AllArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * Añade un producto al carrito de un cliente
     *
     * @param addProductRequest
     * @param userDetails
     * @return
     * @throws CustomException
     */
    @PostMapping("/addProduct")
    public ResponseEntity<AddProductResponse> addProduct(
            @RequestBody AddProductRequest addProductRequest,
            @AuthenticationPrincipal UserDetails userDetails) throws CustomException {

        if (addProductRequest.getQuantity() < 1) {
            throw new CustomException("El número de articulos a añadir no puede ser menor a 1", HttpStatus.BAD_REQUEST);
        }

        CartHasProductsEntity cartHasProductsEntity = this.cartService.addProduct(
                userDetails.getUsername(),
                addProductRequest.getId_product(),
                addProductRequest.getQuantity());

        AddProductResponse response = new AddProductResponse(cartHasProductsEntity);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/getAllProducts")
    public ResponseEntity<CartSummaryResponse> getAllProducts(
            @AuthenticationPrincipal UserDetails userDetails) throws CustomException {

        List<CartHasProductsEntity> allCartProducts = this.cartService.getAllProducts(userDetails.getUsername());
        if (allCartProducts.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        CartSummaryResponse response = new CartSummaryResponse(allCartProducts);
        return ResponseEntity.ok(response);
    }
}
