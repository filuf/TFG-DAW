package com.cafeteria.ventura.orders.order.usecase;

import com.cafeteria.ventura.orders.cart.models.CartEntity;
import com.cafeteria.ventura.orders.cart.models.CartHasProductsEntity;
import com.cafeteria.ventura.orders.cart.services.CartService;
import com.cafeteria.ventura.orders.exceptions.CustomException;
import com.cafeteria.ventura.orders.order.dto.OrderDTO;
import com.cafeteria.ventura.orders.order.services.OrderService;
import com.cafeteria.ventura.orders.security.models.UserEntity;
import com.cafeteria.ventura.orders.security.services.UserEntityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class MakeOrderUseCaseImplTest {

    private MakeOrderUseCaseImpl makeOrderUseCase;

    @Mock
    private CartService cartService;

    @Mock
    private OrderService orderService;

    @Mock
    private UserEntityService userEntityService;

    @BeforeEach
    void setUp() {
        this.makeOrderUseCase = new MakeOrderUseCaseImpl(cartService, orderService, userEntityService);
    }

    @Test
    void makeOrder_whenUsernameNotExist_shouldThrow403() {
        when(userEntityService.findByUsername(anyString()))
                .thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class,
                () -> makeOrderUseCase.makeOrder("", ""));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    @Test
    void makeOrder_whenCartHasntProducts_shouldThrow400() {
        when(userEntityService.findByUsername(anyString()))
                .thenReturn(Optional.of(new UserEntity()));

        when(cartService.getAllProducts((CartEntity) any()))
                .thenReturn(List.of());

        CustomException exception = assertThrows(CustomException.class,
                () -> makeOrderUseCase.makeOrder("", ""));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void makeOrder_whenHappyPath_shouldReturnOrderDetails() throws CustomException {
        when(userEntityService.findByUsername(anyString()))
                .thenReturn(Optional.of(new UserEntity()));

        when(cartService.getAllProducts((CartEntity) any()))
                .thenReturn(List.of(new CartHasProductsEntity()));

        when(orderService.registerOrder(any(), any(), anyBoolean(), any()))
                .thenReturn(OrderDTO.builder().build());

        doNothing()
                .when(cartService)
                .clearCart(any());

        makeOrderUseCase.makeOrder("","");

        verify(cartService).clearCart(any());
    }
}