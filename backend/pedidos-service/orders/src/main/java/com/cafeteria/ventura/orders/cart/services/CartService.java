package com.cafeteria.ventura.orders.cart.services;

import com.cafeteria.ventura.orders.cart.models.CartEntity;
import com.cafeteria.ventura.orders.cart.models.CartHasProductsEntity;
import com.cafeteria.ventura.orders.cart.models.CartHasProductsId;
import com.cafeteria.ventura.orders.cart.repositories.CartHasProductsRepository;
import com.cafeteria.ventura.orders.cart.repositories.CartRepository;
import com.cafeteria.ventura.orders.exceptions.CustomException;
import com.cafeteria.ventura.orders.product.models.ProductEntity;
import com.cafeteria.ventura.orders.product.services.ProductService;
import com.cafeteria.ventura.orders.security.models.UserEntity;
import com.cafeteria.ventura.orders.security.services.UserEntityService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartHasProductsRepository cartHasProductsRepository;
    private final UserEntityService userEntityService;
    private final ProductService productService;

    public CartHasProductsEntity addProduct(String username, Long idProduct, Integer quantity) throws CustomException {
        CartEntity cart = this.getCartByUsername(username);

        Optional<ProductEntity>optProduct = productService.getProductById(idProduct);
        if (optProduct.isEmpty()) { // el producto no existe en la db
            throw new CustomException("El producto a añadir no existe en la base de datos", HttpStatus.NOT_FOUND);
        }
        ProductEntity product = optProduct.get();

        CartHasProductsId cartHasProductsId = new CartHasProductsId(idProduct, cart.getIdCart());
        Optional<CartHasProductsEntity> optCartHasProductsEntity = cartHasProductsRepository.findById(cartHasProductsId);
        if (optCartHasProductsEntity.isPresent()) { // si ya existe este producto en mi carrito
            quantity += optCartHasProductsEntity.get().getQuantity();
        }

        return cartHasProductsRepository.save(
          CartHasProductsEntity.builder()
                  .id(cartHasProductsId)
                  .cart(cart)
                  .product(product)
                  .quantity(quantity)
                  .build()
        );
    }

    private CartEntity getCartByUsername (String username) throws CustomException {
        Optional<UserEntity> optUserEntity = userEntityService.findByUsername(username);
        if (optUserEntity.isEmpty()) {
            throw new CustomException("Usuario no encontrado en la base de datos, vuelve a iniciar sesión", HttpStatus.FORBIDDEN);
        }
        UserEntity user = optUserEntity.get();

        Optional<CartEntity> optCartEntity = cartRepository.findByUser_idUser(user.getIdUser());

        return optCartEntity.orElseGet(() -> cartRepository.save( //nuevo carrito
                CartEntity.builder()
                        .user(user)
                        .build()
        ));
    }

    public List<CartHasProductsEntity> getAllProducts(String username) throws CustomException {
        CartEntity cart = this.getCartByUsername(username);
        return this.cartHasProductsRepository.findAllByCart(cart);
    }
}
