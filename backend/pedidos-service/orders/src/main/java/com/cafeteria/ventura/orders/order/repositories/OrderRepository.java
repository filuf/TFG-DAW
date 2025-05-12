package com.cafeteria.ventura.orders.order.repositories;

import com.cafeteria.ventura.orders.order.models.OrderEntity;
import com.cafeteria.ventura.orders.security.models.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    /**
     * Trae paginadamente toda la consulta
     * orderList {
     *     order {
     *        product {
     *           details
     *        }
     *        ...
     *     }
     *     ...
     * }
     *
     * @param user usuario que tiene el historial
     * @param pageable parametros de paginación
     * @return historial de pedidos
     */
    @EntityGraph(attributePaths = {"orderHasProducts", "orderHasProducts.product"})
    Page<OrderEntity> findAllByUser(UserEntity user, Pageable pageable);
}
