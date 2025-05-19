package com.cafeteria.ventura.mailer.services;

import com.cafeteria.ventura.mailer.dto.SendMailRequest;
import com.cafeteria.ventura.mailer.exceptions.CustomException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String fromMail;

    /**
     * Envía un mail con los parámetros proporcionados
     *
     * @param request parametros del mail
     * @throws CustomException lanza un 400 si la dirección no es válida o el asunto excede los 50 caracteres
     */
    public void sendValidMail(SendMailRequest request) throws CustomException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromMail);

            String sendTo = request.getSendToEmail();
            if (!validateEmailDirection(sendTo)) {
                throw new CustomException("El mail proporcionado es invalido", HttpStatus.BAD_REQUEST);
            }
            helper.setTo(sendTo);

            String subject = request.getSubject();
            if (subject.length() > 50) {
                throw new CustomException("El asunto no puede superar los 50 caracteres", HttpStatus.BAD_REQUEST);
            }
            helper.setSubject(subject);

            // indicamos que es html
            helper.setText(request.getText(), true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new CustomException("Error al enviar el correo: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Valida si una dirección de mail cumple con una expresión regular extraida de <a href="https://www.baeldung.com/java-email-validation-regex">baeldung</a>
     *
     * @param email email a comprobar
     * @return true si es válido, false si no lo es
     */
    private boolean validateEmailDirection(String email) {
        Pattern pattern = Pattern.compile("^(?=.{1,64}@)[A-Za-z0-9_-]+(\\.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})$");
        return pattern.matcher(email).matches();
    }
}
