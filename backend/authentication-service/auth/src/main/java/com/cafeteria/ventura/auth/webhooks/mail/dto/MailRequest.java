package com.cafeteria.ventura.auth.webhooks.mail.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@AllArgsConstructor
@Getter
@Builder
public class MailRequest {

    private String sendToEmail;
    private String subject;
    private String text;
}
