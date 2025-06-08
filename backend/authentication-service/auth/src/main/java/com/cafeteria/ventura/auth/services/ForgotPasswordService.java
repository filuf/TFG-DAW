package com.cafeteria.ventura.auth.services;

import com.cafeteria.ventura.auth.webhooks.mail.MailWebhook;
import com.cafeteria.ventura.auth.webhooks.mail.dto.MailRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ForgotPasswordService {

    private final MailWebhook mailWebhook;

    @Value("${app.web-servers.astro}")
    private String astroUrl;

    public void sendMailRecoverPassword(String mail, String recoveryToken) {

        String mailBody =
                "<html>" +
                    "<p>Hola, accede a este link para recuperar tu contraseña <a href=\"" + astroUrl + "/recovery" + "?recoveryToken=" + recoveryToken + "\">link</a></p>" +
                    "<p>Si no has solicitado este cambio de contraseña o no eres el propietario, por favor, contacta con el personal de la cafetería<p>" +
                "<html>";

        MailRequest mailRequest = MailRequest.builder()
                        .sendToEmail(mail)
                        .subject("Restablece tu contraseña en cafetería IES Ventura")
                        .text(mailBody)
                        .build();

        this.mailWebhook.sendMail(mailRequest);
    }
}
