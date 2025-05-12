package com.cafeteria.ventura.auth.dto;

public record ChangePasswordRequest(String email, String password, String newPassword, String passwordConf) {
}
