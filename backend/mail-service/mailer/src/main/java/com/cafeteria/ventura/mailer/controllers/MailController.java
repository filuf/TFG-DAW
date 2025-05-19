package com.cafeteria.ventura.mailer.controllers;

import com.cafeteria.ventura.mailer.dto.SendMailRequest;
import com.cafeteria.ventura.mailer.exceptions.CustomException;
import com.cafeteria.ventura.mailer.services.MailService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mail")
@AllArgsConstructor
public class MailController {

    private MailService mailService;

    @PostMapping("/send")
    public ResponseEntity<?> sendMail(@RequestBody SendMailRequest request) throws CustomException {
        this.mailService.sendValidMail(request);

        return ResponseEntity.noContent().build();
    }
}
