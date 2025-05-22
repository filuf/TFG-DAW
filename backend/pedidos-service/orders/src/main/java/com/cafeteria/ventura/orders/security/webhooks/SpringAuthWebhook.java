package com.cafeteria.ventura.orders.security.webhooks;

import com.cafeteria.ventura.orders.exceptions.CustomException;
import com.cafeteria.ventura.orders.security.models.UserAuthority;
import com.cafeteria.ventura.orders.security.webhooks.dto.LoginRequest;
import com.cafeteria.ventura.orders.security.webhooks.dto.LoginResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Slf4j
@Service
public class SpringAuthWebhook {

    @Value("${app.webhook.spring-auth}")
    private String springAuthServiceUrl;

    @Value("${app.system-user-details.user}")
    private String systemUser;
    @Value("${app.system-user-details.password}")
    private String systemPassword;

    /**
     * Hace una petición al microservicio de autenticación con credenciales de system
     * tras una serie de validaciones devuelve el token
     *
     * @return jwt de usuario con rol System
     * @throws CustomException sí hay un fallo de comunicación con el microservicio de autenticación
     */
    public String getSystemJwtToken() throws CustomException {

        LoginRequest request = new LoginRequest(systemUser, systemPassword);

        log.info("Lanzando petición al microservicio de autenticación");
        RestClient client = generateRestClient();
        ResponseEntity<LoginResponse> response = client.post()
                .uri("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .toEntity(LoginResponse.class);
        log.info("Status code de la respuesta, Status code: {}", response.getStatusCode().value());

        if (response.getStatusCode().isError()) {
            throw new CustomException("Ha habido un error interno de comunicación: AUTH_SERVICE_UNAVAILABLE, por favor, contacta con los administradores", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        LoginResponse body = response.getBody();

        if (!body.authorities().contains(UserAuthority.SYSTEM)) {
            throw new CustomException("Ha habido un error interno de comunicación: SYSTEM_USER_DONT_EXIST, por favor, contacta con los administradores", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return body.token();
    }

    private RestClient generateRestClient() {
        //forzamos HTTP_1_1 TODO: (conveniente cambiar a http3 si sobra tiempo)
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(5))
                .build();

        return RestClient.builder()
                .requestFactory(new JdkClientHttpRequestFactory(httpClient))
                .baseUrl(this.springAuthServiceUrl)
                .build();
    }
}
