package com.cafeteria.ventura.orders.order.usecase;

import com.cafeteria.ventura.orders.cart.models.CartEntity;
import com.cafeteria.ventura.orders.cart.models.CartHasProductsEntity;
import com.cafeteria.ventura.orders.cart.services.CartService;
import com.cafeteria.ventura.orders.exceptions.CustomException;
import com.cafeteria.ventura.orders.order.dto.OrderDTO;
import com.cafeteria.ventura.orders.order.services.OrderService;
import com.cafeteria.ventura.orders.security.models.UserEntity;
import com.cafeteria.ventura.orders.security.services.UserEntityService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class MakeOrderUseCaseImpl implements MakeOrderUseCase {

    private CartService cartService;
    private OrderService orderService;
    private UserEntityService userEntityService;

    @Override
    public OrderDTO makeOrder(String username, String description) throws CustomException {

        // traer user
        UserEntity user = userEntityService.findByUsername(username).orElseThrow(
                () -> new CustomException("Usuario no encontrado en la base de datos, vuelve a iniciar sesión", HttpStatus.FORBIDDEN));

        //traer carrito
        CartEntity cart = this.cartService.getCartByUserEntity(user);

        // traer productos
        List<CartHasProductsEntity> products = this.cartService.getAllProducts(cart);
        if (products.isEmpty()) {
            throw new CustomException("No se puede hacer un pedido sin productos en el carrito", HttpStatus.BAD_REQUEST);
        }

        //todo: webhook a sumup
        boolean isPaid = false;

        // insertar orden en la db
        OrderDTO orderDetails = this.orderService.registerOrder(user, products, isPaid, description);

        // vaciar carrito por id de carrito
        this.cartService.clearCart(cart);


        return orderDetails;
    }
}
