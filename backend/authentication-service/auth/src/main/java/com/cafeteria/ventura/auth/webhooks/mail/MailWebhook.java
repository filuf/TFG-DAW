package com.cafeteria.ventura.auth.webhooks.mail;

import com.cafeteria.ventura.auth.webhooks.mail.dto.MailRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailWebhook {

    @Value("${app.webhook.mail}")
    private String mailServiceUrl;

    private RestClient generateRestClient() {
        //forzamos HTTP_1_1 TODO: (conveniente cambiar a http3 si sobra tiempo)
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(5))
                .build();

        return RestClient.builder()
                .requestFactory(new JdkClientHttpRequestFactory(httpClient))
                .baseUrl(this.mailServiceUrl)
                .build();
    }

    @Async
    public void sendMail (MailRequest request) {
        RestClient client = this.generateRestClient();

        var response = client.post()
                .uri("/mail/send")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .toBodilessEntity();

        log.info("Respuesta a webHook mail. request: {}, response: {}", request, response);
    }
}
