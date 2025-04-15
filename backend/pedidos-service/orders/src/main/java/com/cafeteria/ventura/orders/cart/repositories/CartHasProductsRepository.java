package com.cafeteria.ventura.orders.cart.repositories;

import com.cafeteria.ventura.orders.cart.models.CartEntity;
import com.cafeteria.ventura.orders.cart.models.CartHasProductsEntity;
import com.cafeteria.ventura.orders.cart.models.CartHasProductsId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartHasProductsRepository extends JpaRepository<CartHasProductsEntity, CartHasProductsId> {
    List<CartHasProductsEntity> findAllByCart(CartEntity cart);
}
