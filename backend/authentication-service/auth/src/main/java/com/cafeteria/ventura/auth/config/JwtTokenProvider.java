package com.cafeteria.ventura.auth.config;

import com.cafeteria.ventura.auth.models.UserEntity;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Date;

/**
 * Genera los tokens cuando el usuario consigue iniciar sesión
 */
@Component
public class JwtTokenProvider {

    // variables de entorno de resources/application.yml
    @Value("${app.security.jwt.secret}")
    private String jwtSecret;

    @Value("${app.security.jwt.expiration}")
    private Long jwtDurationSeconds;

    /**
     * Genera un token JWT
     *
     * @param authentication contexto de Spring Security
     * @return token JWT
     */
    public String generateToken(Authentication authentication) {
        // trae el usuario del contexto en el que lo guardamos en doFilterInternal
        UserEntity user = (UserEntity) authentication.getPrincipal();

        return Jwts.builder()
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS512)
                .setHeaderParam("typ", "JWT") //type JWT estandar
                .setSubject(Long.toString(user.getIdUser()))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + (jwtDurationSeconds * 1000)))
                .claim("username", user.getUsername()) //guarda username y email en el map de claims
                .claim("email", user.getEmail())
                .compact();
    }

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
