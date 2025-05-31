package com.cafeteria.ventura.orders.order.services;

import com.cafeteria.ventura.orders.cart.models.CartHasProductsEntity;
import com.cafeteria.ventura.orders.cart.models.CartHasProductsId;
import com.cafeteria.ventura.orders.exceptions.CustomException;
import com.cafeteria.ventura.orders.order.dto.OrderDTO;
import com.cafeteria.ventura.orders.order.dto.OrderProductDTO;
import com.cafeteria.ventura.orders.order.models.OrderEntity;
import com.cafeteria.ventura.orders.order.models.OrderHasProductsEntity;
import com.cafeteria.ventura.orders.order.models.OrderState;
import com.cafeteria.ventura.orders.order.repositories.OrderRepository;
import com.cafeteria.ventura.orders.order.webhooks.nest.NestjsWebhook;
import com.cafeteria.ventura.orders.product.models.ProductEntity;
import com.cafeteria.ventura.orders.security.models.UserEntity;
import com.cafeteria.ventura.orders.security.services.UserEntityService;
import org.instancio.Instancio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    private OrderService orderService;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserEntityService userEntityService;

    @Mock
    private NestjsWebhook nestjsWebhook;

    @BeforeEach
    void setUp() {
        this.orderService = new OrderService(orderRepository, userEntityService, nestjsWebhook);
    }

    @Test
    void getOrdersByUsername_whenUsuarioNotExist_shouldThrow403() {

        when(userEntityService.findByUsername(any()))
                .thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class,
                () -> orderService.getOrdersByUsername("", Pageable.unpaged()));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    @Test
    void getOrdersByUsername_whenUsuarioExist_shouldReturnOrderDto() throws CustomException {

        when(userEntityService.findByUsername(any()))
                .thenReturn(Optional.of(new UserEntity()));

        OrderEntity order1 = Instancio.create(OrderEntity.class);
        OrderEntity order2 = Instancio.create(OrderEntity.class);
        OrderEntity order3 = Instancio.create(OrderEntity.class);
        OrderEntity order4 = Instancio.create(OrderEntity.class);

        List<OrderEntity> ordersList = List.of(
                order1, order2, order3, order4
        );


        when(orderRepository.findAllByUser(any(), any()))
                .thenReturn(new PageImpl<OrderEntity>(ordersList));

        Page<OrderDTO> ordersPaged = orderService.getOrdersByUsername("", Pageable.unpaged());

        assertEquals(ordersList.size(), ordersPaged.getSize());

        OrderDTO firstElement = ordersPaged.getContent().getFirst();

        assertEquals(order1.getId(), firstElement.getId());
        assertEquals(order1.getDescription(), firstElement.getDescription());
        assertEquals(order1.isPaid(), firstElement.isPaid());

        List<OrderHasProductsEntity> orderListProducts = order1.getOrderHasProducts().stream().toList();
        List<OrderProductDTO> orderPageProducts = firstElement.getProducts();

        assertEquals(
                orderListProducts.stream().map(orderHasProductsEntity -> orderHasProductsEntity.getProduct().getProductPrice())
                        .reduce(Float::sum),
                orderPageProducts.stream().map(OrderProductDTO::getPrice)
                        .reduce(Float::sum)
        );

        assertEquals(
                orderListProducts.stream().map(OrderHasProductsEntity::getQuantity)
                        .reduce(Integer::sum),
                orderPageProducts.stream().map(OrderProductDTO::getQuantity)
                        .reduce(Integer::sum)
        );

        List<Long> listIdList = orderListProducts.stream().map(OrderHasProductsEntity::getProduct)
                .map(ProductEntity::getIdProduct)
                .sorted(Long::compareTo)
                .toList();
        List<Long> listIdPage = orderPageProducts.stream()
                .map(OrderProductDTO::getProductId)
                .sorted(Long::compareTo)
                .toList();

        for (int i = 0; i < listIdList.size(); i++) {
            assertEquals(listIdList.get(i), listIdPage.get(i));
        }


    }

    @Test
    void registerOrder_whenNestNotAvailable_shouldThrow500() {
        OrderEntity order = new OrderEntity();

        when(orderRepository.save(any()))
                .thenReturn(order);

        when(nestjsWebhook.sendOrderToNest(any(), any()))
                .thenReturn(ResponseEntity.notFound().build());

        CustomException exception = assertThrows(CustomException.class,
                () -> orderService.registerOrder(new UserEntity(), List.of(), false, ""));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
    }

    @Test
    void registerOrder_whenNestAvailable_shouldReturnOrderDTO() throws CustomException {

        String description = "descripcion";
        Long orderId = 1L;

        OrderEntity order = OrderEntity.builder()
                .id(orderId)
                .state(OrderState.PENDIENTE)
                .user(new UserEntity())
                .description(description)
                .isPaid(false)
                .build();

        ProductEntity product1 = new ProductEntity();
        product1.setIdProduct(1L);

        ProductEntity product2 = new ProductEntity();
        product2.setIdProduct(2L);

        Long cartId = 1L;

        CartHasProductsEntity cartProd1 = CartHasProductsEntity.builder()
                .id(new CartHasProductsId(cartId, product1.getIdProduct()))
                .product(product1)
                .quantity(4)
                .build();
        CartHasProductsEntity cartProd2 = CartHasProductsEntity.builder()
                .id(new CartHasProductsId(cartId, product2.getIdProduct()))
                .product(product2)
                .quantity(6)
                .build();

        Set<CartHasProductsEntity> cart = Set.of(cartProd1, cartProd2);

        when(orderRepository.save(any()))
                .thenReturn(order);

        when(nestjsWebhook.sendOrderToNest(any(), any()))
                .thenReturn(ResponseEntity.ok().build());

        OrderDTO orderDTO = orderService.registerOrder(new UserEntity(), cart, false, description);

        assertEquals(description, orderDTO.getDescription());
        assertFalse(orderDTO.isPaid());
        assertEquals(2, orderDTO.getProducts().size());
    }

}