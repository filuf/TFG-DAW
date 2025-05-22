package com.cafeteria.ventura.orders.security.schedule;

import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Component;

@Component
@Getter
@Setter
public class SystemJwt {
    private String systemJwt;
}
