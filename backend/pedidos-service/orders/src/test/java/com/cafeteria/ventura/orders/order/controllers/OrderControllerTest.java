package com.cafeteria.ventura.orders.order.controllers;

import com.cafeteria.ventura.orders.order.dto.MakeNewOrderRequest;
import com.cafeteria.ventura.orders.order.dto.OrderDTO;
import com.cafeteria.ventura.orders.order.services.OrderService;
import com.cafeteria.ventura.orders.order.usecase.MakeOrderUseCase;
import com.cafeteria.ventura.orders.security.config.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.mockito.Mockito.*;

@WebMvcTest(value = OrderController.class)
@AutoConfigureMockMvc(addFilters = false) // omite todos los filtros de solicitudes
class OrderControllerTest {

    @MockitoBean
    private JwtTokenProvider tokenProvider;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private OrderService orderService;

    @MockitoBean
    private MakeOrderUseCase makeOrderUseCase;

    @Test
    @WithMockUser(username = "ususaurio", roles = "USER")
    void getOrderUserHistory() throws Exception {

        when(orderService.getOrdersByUsername(any(), any()))
                .thenReturn(Page.empty());

        mockMvc.perform(MockMvcRequestBuilders.get("/order/history"))
                .andExpect(MockMvcResultMatchers.status().isOk());
    }

    @Test
    @WithMockUser(username = "ususaurio", roles = "USER")
    void makeNewOrder() throws Exception {

        MakeNewOrderRequest request = new MakeNewOrderRequest();

        when(makeOrderUseCase.makeOrder(any(), any()))
                .thenReturn(OrderDTO.builder().build());

        mockMvc.perform(MockMvcRequestBuilders.post("/order/newOrder")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isCreated());

    }
}