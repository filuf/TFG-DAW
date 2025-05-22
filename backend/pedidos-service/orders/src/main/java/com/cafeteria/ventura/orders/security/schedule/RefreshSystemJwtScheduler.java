package com.cafeteria.ventura.orders.security.schedule;

import com.cafeteria.ventura.orders.exceptions.CustomException;
import com.cafeteria.ventura.orders.security.webhooks.SpringAuthWebhook;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Slf4j
@RequiredArgsConstructor
@Getter
@EnableScheduling
@Configuration
public class RefreshSystemJwtScheduler {

    private final SpringAuthWebhook authWebhook;
    private final SystemJwt systemJwt;

    /**
     * Refresca el JWT de sistema antes de que expire
     *
     * @throws CustomException sí hay un fallo de comunicación con el microservicio de autenticación
     */
    @Scheduled(fixedRateString = "${app.security.jwt.refresh-rate-ms}")
    private void refreshSystemJwt() throws CustomException {
        String jwtToken = this.authWebhook.getSystemJwtToken();
        this.systemJwt.setSystemJwt(jwtToken);
        log.info("Token de sistema refrescado");
    }

    /**
     * Ejecuta la tarea al iniciar el programa
     *
     * @throws CustomException sí hay un fallo de comunicación con el microservicio de autenticación
     */
    @PostConstruct
    private void initSystemJwt() throws CustomException {
        log.info("Inicializando Token de sistema");
        refreshSystemJwt();
    }

}
