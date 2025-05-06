package com.cafeteria.ventura.orders.cart.controllers;

import com.cafeteria.ventura.orders.cart.dto.AddProductRequest;
import com.cafeteria.ventura.orders.cart.dto.AddProductResponse;
import com.cafeteria.ventura.orders.cart.dto.CartSummaryResponse;
import com.cafeteria.ventura.orders.cart.dto.DeleteProductRequest;
import com.cafeteria.ventura.orders.cart.models.CartHasProductsEntity;
import com.cafeteria.ventura.orders.cart.services.CartService;
import com.cafeteria.ventura.orders.exceptions.CustomException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
     * @param addProductRequest id del producto y cantidad
     * @param userDetails detalles del usuario extraidos del token JWT
     * @return detalles del producto añadido
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
                addProductRequest.getIdProduct(),
                addProductRequest.getQuantity());

        AddProductResponse response = new AddProductResponse(cartHasProductsEntity);

        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene el contenido del carrito y devuelve algunos cálculos, si el carrito está vacío no devuelve nada
     *
     * @param userDetails detalles del usuario extraidos del JWT
     * @return contenido del carrito
     * @throws CustomException si el usuario ha sido borrado de la base de datos
     */
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

    /**
     * Elimina una unidad de un producto
     *
     * @param deleteProductRequest id del producto
     * @param userDetails detalles del usuario extraidos del token JWT
     * @return Carrito completo una vez actualizado
     * @throws CustomException Cuando el producto no está en el carrito o no existe
     */
    @PostMapping("/deleteOneProduct")
    public ResponseEntity<CartSummaryResponse> deleteOneProduct(
            @RequestBody DeleteProductRequest deleteProductRequest,
            @AuthenticationPrincipal UserDetails userDetails) throws CustomException {

        //encuentra el registro de carrito más producto
        CartHasProductsEntity productInCart = this.cartService.getProductById(
                userDetails.getUsername(), deleteProductRequest.getIdProduct())
                .orElseThrow( () -> new CustomException("No se puede eliminar un producto del carrito que no está en el carrito", HttpStatus.NOT_FOUND));

        //elimina el producto o resta 1 a la cantidad si es mayor que 1
        this.cartService.deleteOneProduct(productInCart);

        //devuelve el carrito completo
        return this.getAllProducts(userDetails);
    }
}
