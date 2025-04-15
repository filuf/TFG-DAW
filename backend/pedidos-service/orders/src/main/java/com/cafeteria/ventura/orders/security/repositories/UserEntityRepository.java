package com.cafeteria.ventura.orders.security.repositories;

import com.cafeteria.ventura.orders.security.models.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio para busqueda y guardado de usuarios en base de datos
 */
@Repository
public interface UserEntityRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);

}
