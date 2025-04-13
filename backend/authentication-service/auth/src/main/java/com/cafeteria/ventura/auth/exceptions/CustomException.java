package com.cafeteria.ventura.auth.exceptions;

import org.springframework.http.HttpStatus;

public class CustomException extends Exception {

    HttpStatus statusCode;

    public CustomException(String message, HttpStatus statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public HttpStatus getStatusCode() {
        return statusCode;
    }
}
