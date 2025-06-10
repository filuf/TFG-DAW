package com.cafeteria.ventura.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class ResetPasswordRequest {

    private String jwtRecoveryToken;

    private String newPassword;

    private String confirmNewPassword;
}
