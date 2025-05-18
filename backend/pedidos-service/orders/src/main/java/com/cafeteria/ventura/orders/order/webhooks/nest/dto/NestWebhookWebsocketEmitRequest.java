package com.cafeteria.ventura.orders.order.webhooks.nest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NestWebhookWebsocketEmitRequest {

    private Long id;
    private String comprador;
    private String descripcion;

    private boolean pagado;
    Set<NestProductDetails> productos;
}
