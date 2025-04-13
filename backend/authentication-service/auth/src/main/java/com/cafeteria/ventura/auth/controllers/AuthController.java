package com.cafeteria.ventura.auth.controllers;

import com.cafeteria.ventura.auth.config.JwtTokenProvider;
import com.cafeteria.ventura.auth.dto.*;
import com.cafeteria.ventura.auth.exceptions.CustomException;
import com.cafeteria.ventura.auth.models.UserEntity;
import com.cafeteria.ventura.auth.services.UserEntityService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.Objects;
import java.util.UUID;

//TODO: para Agustín - Crear swagger openApi, hacer una pull request y mandar whatsApp para aceptar cambios

/**
 * Controlador principal para autenticación
 * No es necesaria la autenticación para los endpoints
 */
@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController {

    private final static int MINIMUM_PASSWORD_LENGTH = 12;

    private UserEntityService userService;
    private AuthenticationManager authManager;
    private JwtTokenProvider jwtTokenProvider;

    /**
     * Registra a un usuario
     *
     * @param userDTO record con campos username, email, password, passwordConf
     * @return los detalles del usuario una vez guardado en la db
     * @throws CustomException Si ocurre alguno de estos errores:
     * <ul>
     *     <li>Si la longitud de la contraseña es menor a {@value AuthController#MINIMUM_PASSWORD_LENGTH} caracteres</li>
     *     <li>Si la contraseña no coincide con su confirmación</li>
     *     <li>Si el usuario ya está registrado</li>
     *     <li>Si el mail ya está registrado</li>
     * </ul>
     *
     */
    @PostMapping("/register")
    public ResponseEntity<UserEntity> register(@RequestBody UserRegisterDTO userDTO) throws CustomException {

        // contraseña demasiado corta
        if (userDTO.password().length() < MINIMUM_PASSWORD_LENGTH) {
            throw new CustomException("La longitud de la contraseña no puede ser menor a " + MINIMUM_PASSWORD_LENGTH + " caracteres", HttpStatus.BAD_REQUEST);
        }

        // contraseñas no iguales notEquals nullsafe
        if (!Objects.equals(userDTO.password(), userDTO.passwordConf())) {
            throw new CustomException("Las contraseñas no coinciden", HttpStatus.BAD_REQUEST);
        }

        // usuario existente
        if (userService.findByUsername(userDTO.username()).isPresent()) {
            throw new CustomException("Ya existe un usuario registrado con este nombre", HttpStatus.CONFLICT);
        }

        // mail existente
        if (userService.findByEmail(userDTO.email()).isPresent()) {
            throw new CustomException("Ya existe un usuario registrado con este email", HttpStatus.CONFLICT);
        }

        UserEntity responseBody = this.userService.save(userDTO);
        return ResponseEntity.created(URI.create("/auth/login")).body(responseBody); // 201
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest loginDTO) {
        Authentication authDTO = new UsernamePasswordAuthenticationToken(loginDTO.username(), loginDTO.password());

        Authentication authentication = this.authManager.authenticate(authDTO);
        UserEntity user = (UserEntity) authentication.getPrincipal();

        String token = this.jwtTokenProvider.generateToken(authentication);

        return new LoginResponse(
                user.getUsername(),
                user.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList(),
                token);
    }

    /**
     * Cambiar la contraseña de un usuario (no es necesario que esté logado)
     * @param passwordDetails
     * @return
     */
    @PostMapping("/change/password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest passwordDetails) {



        return ResponseEntity.ok("si, tu email es ");
    }

    //TODO: postmapping changeUsername
    @PostMapping("/change/email")
    public ResponseEntity<String> changeEmail(@RequestBody ChangeEmailRequest emailRequest) {

        // todo: logica actualizar email


        return ResponseEntity.ok("Email restablecido correctamente");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest passwordRequest) {

        String email = passwordRequest.email();

        UUID identifier = UUID.randomUUID();
        //TODO: service almacenar en db identifier + email con fecha de caducidad hasta 1 día después

        //TODO: logica mandar mail con URL de web predefinida

        return ResponseEntity.ok("Te hemos mandado un mail a la dirección " + email + " para que puedas restablecer tu contraseña");
    }

    /**
     *
     * @param resetPassword
     * @return
     */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword (@RequestBody ResetPasswordRequest resetPassword) throws CustomException {

        String newPassword = resetPassword.newPassword();
        String newPasswordConf = resetPassword.newPasswordConf();

        // contraseña demasiado corta
        if (newPasswordConf.length() < MINIMUM_PASSWORD_LENGTH) {
            throw new CustomException("La longitud de la contraseña no puede ser menor a " + MINIMUM_PASSWORD_LENGTH + " caracteres", HttpStatus.BAD_REQUEST);
        }

        // contraseñas no iguales notEquals nullsafe
        if (!Objects.equals(newPassword, newPasswordConf)) {
            throw new CustomException("Las contraseñas no coinciden", HttpStatus.BAD_REQUEST);
        }

        //TODO: validar email + uuid en la db

        //TODO: actualizar contraseña + borrar registro

        return ResponseEntity.ok("La contraseña se ha cambiado con éxito");
    }
}
