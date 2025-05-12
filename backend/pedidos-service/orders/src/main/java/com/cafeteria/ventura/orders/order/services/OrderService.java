package com.cafeteria.ventura.orders.order.services;

import com.cafeteria.ventura.orders.exceptions.CustomException;
import com.cafeteria.ventura.orders.order.dto.OrderDTO;
import com.cafeteria.ventura.orders.order.dto.OrderProductDTO;
import com.cafeteria.ventura.orders.order.models.OrderEntity;
import com.cafeteria.ventura.orders.order.repositories.OrderRepository;
import com.cafeteria.ventura.orders.security.models.UserEntity;
import com.cafeteria.ventura.orders.security.services.UserEntityService;
import lombok.AllArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class OrderService {

    private OrderRepository orderRepository;
    private UserEntityService userEntityService;

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
                .build();
    }
}
