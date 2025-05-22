package com.cafeteria.ventura.orders.security.webhooks.dto;

/**
 * Se recibe en una petición de Login
 *
 * @param username usuario
 * @param password contraseña del usuario
 */
public record LoginRequest(String username, String password) {
}
