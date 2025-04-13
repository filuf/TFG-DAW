package com.cafeteria.ventura.auth.controllers;

import com.cafeteria.ventura.auth.exceptions.CustomException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionController {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<String> handlerCustomException (CustomException exc) {

        return ResponseEntity.status(exc.getStatusCode()).body(exc.getMessage());
    }
}
