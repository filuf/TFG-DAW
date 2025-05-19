package com.cafeteria.ventura.mailer.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Getter
public class SendMailRequest {

    private String sendToEmail;
    private String subject;
    private String text;
}
