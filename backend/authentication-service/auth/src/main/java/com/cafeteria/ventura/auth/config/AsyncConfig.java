package com.cafeteria.ventura.auth.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Habilita el uso de anotaciones como @Async para poder usar webhooks sin importar el retorno
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
