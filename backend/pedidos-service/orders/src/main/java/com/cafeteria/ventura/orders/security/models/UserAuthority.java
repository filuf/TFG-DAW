package com.cafeteria.ventura.orders.security.models;

/**
 * USER - Usuario raso, cliente de la cafetería (alta desde /autb/register)
 * ADMIN - Rol del personal de la cafertería con acceso al historico y a los pedidos en tiempo real (alta manual)
 * SYSTEM - Rol de los microservicios para webhooks y en general acceso a otros servicios (alta manual)
 */
public enum UserAuthority {
    USER, ADMIN, SYSTEM
}
