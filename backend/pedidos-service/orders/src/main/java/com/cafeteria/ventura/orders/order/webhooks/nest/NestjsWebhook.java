package com.cafeteria.ventura.orders.order.webhooks.nest;

import com.cafeteria.ventura.orders.order.dto.OrderDTO;
import com.cafeteria.ventura.orders.order.webhooks.nest.dto.NestWebhookWebsocketEmitRequest;
import com.cafeteria.ventura.orders.order.webhooks.nest.dto.NestWebhookWebsocketEmitResponse;
import com.cafeteria.ventura.orders.order.webhooks.nest.dto.NestProductDetails;
import com.cafeteria.ventura.orders.security.schedule.SystemJwt;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NestjsWebhook {

    private final SystemJwt systemJwt;

    @Value("${app.webhook.nest}")
    private String nestServiceUrl;

    private RestClient generateRestClient() {
        //forzamos HTTP_1_1 TODO: (conveniente cambiar a http3 si sobra tiempo)
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(5))
                .build();

        return RestClient.builder()
                .requestFactory(new JdkClientHttpRequestFactory(httpClient))
                .baseUrl(this.nestServiceUrl)
                .build();
    }
    public ResponseEntity<NestWebhookWebsocketEmitResponse> sendOrderToNest(OrderDTO order, String username) {
        RestClient client = generateRestClient();

        //TODO: ADAPTAR DTO EN AMBOS MICROS
        NestWebhookWebsocketEmitRequest nestWebhookWebsocketEmitRequest = NestWebhookWebsocketEmitRequest.builder()
                .id(order.getId())
                .comprador(username)
                .descripcion(order.getDescription())
                .pagado(order.isPaid())
                .productos(
                        order.getProducts().stream()
                                .map(product -> new NestProductDetails(product.getName(), product.getQuantity()))
                                .collect(Collectors.toSet())
                )
                .build();


        return client.post()
                .uri("/websocket/emit")
                .header("Authorization", "Bearer " + this.systemJwt.getSystemJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .body(nestWebhookWebsocketEmitRequest)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .toEntity(NestWebhookWebsocketEmitResponse.class);
    }
}
