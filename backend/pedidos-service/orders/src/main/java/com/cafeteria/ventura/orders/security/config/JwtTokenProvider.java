package com.cafeteria.ventura.orders.security.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;


/**
 * Valida los tokens
 */
@Component
public class JwtTokenProvider {

    // variable de entorno de resources/application.yml
    @Value("${app.security.jwt.secret}")
    private String jwtSecret;

    /**
     * Comprueba si el token es un JWT válido
     * @param token token a comprobar
     */
    public boolean isValidToken(String token) {
        //si es nulo o no tiene longitud
        if (!StringUtils.hasLength(token)) {
            return false;
        }

        try {
            JwtParser validator = Jwts.parser()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                    .build();

            validator.parseClaimsJws(token);
            return true;

        } catch (SignatureException e) {
            System.out.println("Error en la firma del token" + e.getMessage());
        } catch (MalformedJwtException | UnsupportedJwtException e) {
            System.out.println("Token incorrecto" + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.out.println("Token expirado" + e.getMessage());
        }
        return false;
    }

    /**
     * Devuelve el username de un token
     * @param token token sobre el que extraer
     * @return username
     */
    public String getUsernameFromToken(String token) {
        JwtParser parser = Jwts.parser()
                .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                .build();

        Claims claims = parser.parseClaimsJws(token).getBody();
        return claims.get("username").toString();
    }
}
