package com.cafeteria.ventura.orders.security.webhooks.dto;

import com.cafeteria.ventura.orders.security.models.UserAuthority;

import java.util.List;

/**
 * Respuesta a un login
 * @param username usuario
 * @param authorities roles
 * @param token token
 */
public record LoginResponse(String username, List<UserAuthority> authorities, String token) {
}
