package com.cafeteria.ventura.orders.security.services;

import com.cafeteria.ventura.orders.security.models.UserEntity;
import com.cafeteria.ventura.orders.security.repositories.UserEntityRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class UserEntityService {

    // inyectados por constructor
    private final UserEntityRepository repository;

    /**
     * Busca un usuario en base de datos por su username
     * @param username usuario a buscar
     * @return Optional del usuario
     */
    public Optional<UserEntity> findByUsername(String username) {
        return this.repository.findByUsername(username);
    }

}

