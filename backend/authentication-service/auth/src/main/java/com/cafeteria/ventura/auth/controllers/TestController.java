package com.cafeteria.ventura.auth.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador para confirmar que la autenticación funciona correctamente
 */
@RestController
public class TestController {

    @GetMapping("/test")
    public ResponseEntity<String> estoyAutenticado() {
        return ResponseEntity.status(418).body("Estás autenticado correctamente 🍵");
    }
}
