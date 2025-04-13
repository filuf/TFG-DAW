package com.cafeteria.ventura.auth.dto;

public record ChangeEmailRequest(String email, String password, String newEmail) {
}
