package com.cafeteria.ventura.auth.dto;

/**
 * Body del usuario al registrarse
 *
 * @param username usuario
 * @param email mail
 * @param password controseña
 * @param passwordConf confirmar contraseña
 */
public record UserRegisterDTO(String username, String email, String password, String passwordConf) {
}
