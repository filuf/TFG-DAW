package com.cafeteria.ventura.orders.exceptions;

import com.cafeteria.ventura.orders.exceptions.CustomException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionController {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<String> handlerCustomException (CustomException exc) {

        return ResponseEntity.status(exc.getStatusCode()).body(exc.getMessage());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        return new ResponseEntity<>("Solicitud mal formada: " + ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    //TODO: IMPLEMENTAR RESPUESTAS A EXCEPCIONES DE TOKEN EXPIRED, ETC...
}
