package com.cafeteria.ventura.auth.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configura el AuthenticationManager, el orden y funcionamiento de la cadena de filtros y el encoder de contraseñas
 */
@EnableWebSecurity
@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    /**
     * Configuración de AuthenticationMmanager
     *
     * @param authenticationConfiguration configura el manager usando los beans HttpSecurity, PasswordEncoder y UserDetailsService
     * @throws Exception si no puede obtener el AuthenticationManager
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /**
     * Cadena de filtros de seguridad
     * <a href="https://docs.spring.io/spring-security/reference/servlet/configuration/java.html">Link documentación</a>
     * <br><br>
     * Todos los filtros funcionan como un middleware que tienen el poder de aprobar, suspender o pasar al siguiente filtro
     *
     * @param http objeto {@link HttpSecurity}
     * @throws Exception lanzada por el build
     */
    @Bean
    public SecurityFilterChain securityFilterChain (HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .sessionManagement( sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.authorizeHttpRequests( req ->
                req.requestMatchers("/auth/**").permitAll()
                        .anyRequest()
                        .authenticated()
        );

        //filtro previo al de usuario y contraseña
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Bean que se encarga de cifrar contraseñas con el algoritmo BCrypt en fuerza por default
     * @return {@link BCryptPasswordEncoder}
     */
    @Bean
    public PasswordEncoder passwordEncoder () {
        return new BCryptPasswordEncoder();
    }
}
