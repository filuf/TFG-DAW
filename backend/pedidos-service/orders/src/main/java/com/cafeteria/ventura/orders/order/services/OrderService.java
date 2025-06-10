package com.cafeteria.ventura.orders.order.services;

import com.cafeteria.ventura.orders.cart.models.CartHasProductsEntity;
import com.cafeteria.ventura.orders.exceptions.CustomException;
import com.cafeteria.ventura.orders.order.dto.OrderDTO;
import com.cafeteria.ventura.orders.order.dto.OrderProductDTO;
import com.cafeteria.ventura.orders.order.models.OrderEntity;
import com.cafeteria.ventura.orders.order.models.OrderHasProductsEntity;
import com.cafeteria.ventura.orders.order.models.OrderHasProductsId;
import com.cafeteria.ventura.orders.order.models.OrderState;
import com.cafeteria.ventura.orders.order.repositories.OrderRepository;
import com.cafeteria.ventura.orders.order.webhooks.nest.NestjsWebhook;
import com.cafeteria.ventura.orders.order.webhooks.nest.dto.NestWebhookWebsocketEmitResponse;
import com.cafeteria.ventura.orders.product.models.ProductEntity;
import com.cafeteria.ventura.orders.security.models.UserEntity;
import com.cafeteria.ventura.orders.security.services.UserEntityService;
import lombok.AllArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class OrderService {

    private OrderRepository orderRepository;
    private UserEntityService userEntityService;
    private NestjsWebhook nestjsWebhook;

    private static final DateTimeFormatter SPANISH_FORMAT =
            DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy, HH:mm").withLocale(Locale.forLanguageTag("es-ES"));

    /**
     *
     * @param username usuario del que se va a extraer el historial de pedidos
     * @param pageable pagina, tamaño y orden
     * @return conjunto de pedidos mapeado
     * @throws CustomException si no se encuentra el usuario en la base de datos (borrado después de expedir el token)
     */
    public Page<OrderDTO> getOrdersByUsername(String username, Pageable pageable) throws CustomException {

        Optional<UserEntity> optUserEntity = userEntityService.findByUsername(username);
        if (optUserEntity.isEmpty()) {
            throw new CustomException("Usuario no encontrado en la base de datos, vuelve a iniciar sesión", HttpStatus.FORBIDDEN);
        }
        UserEntity user = optUserEntity.get();

        Page<OrderEntity> ordersPaged = orderRepository.findAllByUser(user, pageable);
        return ordersPaged.map(this::mapOrderToDTO);
    }

    public OrderDTO registerOrder(UserEntity user, Collection<CartHasProductsEntity> products, boolean isPaid, String description) throws CustomException {

        //crear order para un usuario
        OrderEntity order = OrderEntity.builder()
                .user(user)
                .state(OrderState.PENDIENTE)
                .isPaid(isPaid)
                .description(description)
                .dateTime(LocalDateTime.now())
                .build();
        order = orderRepository.save(order);

        //registrar producto y cantidad a ese order
        order.setOrderHasProducts(this.mapCartProductsToOrderProducts(products, order));

        //guardar order con sus productos
        order = this.orderRepository.save(order);

        //mapear order
        OrderDTO orderDTO = mapOrderToDTO(order);

        // mandar post a nest
        ResponseEntity<NestWebhookWebsocketEmitResponse> response = nestjsWebhook.sendOrderToNest(orderDTO, user.getUsername());
        if (response.getStatusCode().is4xxClientError()) {
            throw new CustomException("Ha ocurrido un error interno al conectarse a la cafetería", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return orderDTO;
    }

    /**
     * Convierte un order en OrderDTO
     * @param order order a convertir
     * @return order convertida
     */
    private OrderDTO mapOrderToDTO(OrderEntity order) {
        List<OrderProductDTO> productDTOs = order.getOrderHasProducts().stream()
                .map(orderHasProduct -> OrderProductDTO.builder()
                        .productId(orderHasProduct.getProduct().getIdProduct())
                        .name(orderHasProduct.getProduct().getProductName())
                        .price(orderHasProduct.getProduct().getProductPrice())
                        .imageUrl(orderHasProduct.getProduct().getUrlImage())
                        .quantity(orderHasProduct.getQuantity())
                        .build())
                .collect(Collectors.toList());

        return OrderDTO.builder()
                .id(order.getId())
                .description(order.getDescription())
                .isPaid(order.isPaid())
                .products(productDTOs)
                .dateTime(order.getDateTime().format(SPANISH_FORMAT))
                .build();
    }

    private Set<OrderHasProductsEntity> mapCartProductsToOrderProducts(Collection<CartHasProductsEntity> cartHasProductsEntity, OrderEntity order) {
        Long orderId = order.getId();
        return cartHasProductsEntity.stream()
                .map(cartProduct -> {
                    Long productId = cartProduct.getId().getProductId();
                    ProductEntity product = cartProduct.getProduct();
                    Integer quantity = cartProduct.getQuantity();

                    return OrderHasProductsEntity.builder()
                            .id(new OrderHasProductsId(orderId, productId))
                            .order(order)
                            .product(product)
                            .quantity(quantity)
                            .build();
                })
                .collect(Collectors.toSet());
    }
}
