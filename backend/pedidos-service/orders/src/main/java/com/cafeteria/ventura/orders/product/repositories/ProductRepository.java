package com.cafeteria.ventura.orders.product.repositories;

import com.cafeteria.ventura.orders.product.models.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
}
