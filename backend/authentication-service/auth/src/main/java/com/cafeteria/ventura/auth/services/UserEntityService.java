package com.cafeteria.ventura.auth.services;

import com.cafeteria.ventura.auth.dto.UserRegisterDTO;
import com.cafeteria.ventura.auth.exceptions.CustomException;
import com.cafeteria.ventura.auth.models.UserAuthority;
import com.cafeteria.ventura.auth.models.UserEntity;
import com.cafeteria.ventura.auth.repositories.UserEntityRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UserEntityService {

    // inyectados por constructor
    private final UserEntityRepository repository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Busca un usuario en base de datos por su username
     * @param username usuario a buscar
     * @return Optional del usuario
     */
    public Optional<UserEntity> findByUsername(String username) {
        return this.repository.findByUsername(username);
    }

    /**
     * Busca un usuario en base de datos por su email
     * @param email email a buscar
     * @return Optional del usuario
     */
    public Optional<UserEntity> findByEmail(String email) {
        return this.repository.findByEmail(email);
    }


    /**
     * Guarda al usuario con la contraseña encriptado y la lista de roles
     * @param userDTO
     * @return
     */
    public UserEntity save(UserRegisterDTO userDTO) {
        UserEntity user = new UserEntity(
                null,
                userDTO.username(),
                passwordEncoder.encode(userDTO.password()),
                userDTO.email(),
                List.of(UserAuthority.USER)
        );
        return this.repository.save(user);
    }

    /**
     * Actualiza la contraseña de un usuario existente
     *
     * @param username nombre de usuario
     * @param newPassword nueva contraseña
     * @return usuario con la contraseña cambiada
     */
    public UserEntity changePasswordByUsername(String username, String newPassword) throws CustomException {

        UserEntity user = this.findByUsername(username)
                .orElseThrow( () -> new CustomException("Este usuario no existe", HttpStatus.NOT_FOUND));

        user.setPassword(passwordEncoder.encode(newPassword));
        return this.repository.save(user);
    }
}
