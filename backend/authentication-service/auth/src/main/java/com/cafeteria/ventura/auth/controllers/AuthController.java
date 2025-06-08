package com.cafeteria.ventura.auth.controllers;

import com.cafeteria.ventura.auth.config.JwtTokenProvider;
import com.cafeteria.ventura.auth.dto.*;
import com.cafeteria.ventura.auth.exceptions.CustomException;
import com.cafeteria.ventura.auth.models.UserEntity;
import com.cafeteria.ventura.auth.services.ForgotPasswordService;
import com.cafeteria.ventura.auth.services.UserEntityService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Objects;
import java.util.UUID;

//TODO: para Agustín - Crear swagger openApi, hacer una pull request y mandar whatsApp para aceptar cambios

/**
 * Controlador principal para autenticación
 * No es necesaria la autenticación para los endpoints
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController {

    private final static int MINIMUM_PASSWORD_LENGTH = 12;

    private UserEntityService userService;
    private AuthenticationManager authManager;
    private JwtTokenProvider jwtTokenProvider;
    private ForgotPasswordService forgotPasswordService;

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
     * PASO 1
     * Envía un mail con la url a la web de astro y un queryParam con un jwtToken para restablecer
     * @param passwordRequest el usuario al cual se le restablece
     * @return mensaje de se ha enviado un mail
     * @throws CustomException
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @RequestBody ForgotPasswordRequest passwordRequest) throws CustomException {

        //busca el usuario en la db
        UserEntity user = this.userService.findByUsername(passwordRequest.getUsername())
                .orElseThrow( () -> new CustomException("Este usuario no existe", HttpStatus.NOT_FOUND));

        //genera un token de recuperación
        String recoveryToken = jwtTokenProvider.generateRecoverPasswordToken(user);

        //manda webhook para el mail
        forgotPasswordService.sendMailRecoverPassword(user.getEmail(), recoveryToken);


        return ResponseEntity.ok("Te hemos enviado un correo con instrucciones para restablecer tu contraseña." +
                " Si no lo recibes en unos minutos, revisa tu carpeta de spam o contáctanos.");
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
