package com.cafeteria.ventura.orders.security.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Extrae el token JWT del header Authorization
 * extiende de {@link OncePerRequestFilter} hace este proceso una vez por petición cuando es necesario
 */

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    /**
     * trae el componente (Service)
     */
    @Lazy //rompe la dependencia circular (necesario desde spring 2.7)
    @Autowired
    private UserDetailsService userService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String token = this.extractToken(request);

        if (this.tokenProvider.isValidToken(token)) {
            //extrae el nombre de usuario y trae sus detalles de la db
            String username = this.tokenProvider.getUsernameFromToken(token);
            UserDetails user = this.userService.loadUserByUsername(username);

            //almacenamos el UserDetails completo para poder acceder a él en los controladores con la anotación @AuthenticationPrincipal
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    user,
                    null,
                    user.getAuthorities());

            //almacenamos en el contexto de seguridad (para extraer más tarde donde necesitemos) y autenticamos
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        //continuamos la chain de las peticiones
        filterChain.doFilter(request, response);
    }


    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        // si es un token JWT lo devuelve sin el tipo de autenticacion Bearer, solo la cadena
        if (StringUtils.hasLength(bearerToken) && bearerToken.startsWith("Bearer")) {
            return bearerToken.substring("Bearer ".length());
        }
        return null;
    }
}
