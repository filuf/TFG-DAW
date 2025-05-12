package com.cafeteria.ventura.auth.dto;

import java.util.List;

/**
 * Respuesta a un login
 * @param username usuario
 * @param authorities roles
 * @param token token
 */
public record LoginResponse(String username, List<String> authorities, String token) {
}
