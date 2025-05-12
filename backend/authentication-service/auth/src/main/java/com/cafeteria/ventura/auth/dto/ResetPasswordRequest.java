package com.cafeteria.ventura.auth.dto;

import java.util.UUID;

public record ResetPasswordRequest(UUID idPassReset, String email, String newPassword, String newPasswordConf) {
}
