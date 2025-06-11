package com.cafeteria.ventura.auth.services;

import com.cafeteria.ventura.auth.webhooks.mail.MailWebhook;
import com.cafeteria.ventura.auth.webhooks.mail.dto.MailRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WelcomeMailService {

    private final MailWebhook mailWebhook;

    @Value("${app.web-servers.astro}")
    private String astroUrl;

    public void sendWelcomeMail(String mail, String username) {
        String mailBody =
                "<html>" +
                        "<p>Bienvenido al servicio de cafetería de tu centro, te has registrado con el nombre de usuario \"" + username + "\".</p>" +
                        "<p>no olvides tu nombre de usuario ya que lo necesitarás para acceder al servicio.</p>" +
                "<html>";

        MailRequest mailRequest = MailRequest.builder()
                .sendToEmail(mail)
                .subject("Bienvenido a la cafetería")
                .text(mailBody)
                .build();

        this.mailWebhook.sendMail(mailRequest);
    }
}
