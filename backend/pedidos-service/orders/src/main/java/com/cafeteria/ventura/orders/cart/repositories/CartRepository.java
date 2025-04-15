package com.cafeteria.ventura.orders.cart.repositories;

import com.cafeteria.ventura.orders.cart.models.CartEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<CartEntity, Long> {

    /**
     * Desestructura la PK de User Entity con _idUser
     * @param idUser id del usuario
     * @return Objeto Carrito
     */
    Optional<CartEntity> findByUser_idUser(Long idUser);
}
