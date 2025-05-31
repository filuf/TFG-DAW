package com.cafeteria.ventura.orders.cart.controllers;

import com.cafeteria.ventura.orders.cart.dto.AddProductRequest;
import com.cafeteria.ventura.orders.cart.dto.DeleteProductRequest;
import com.cafeteria.ventura.orders.cart.models.CartHasProductsEntity;
import com.cafeteria.ventura.orders.cart.services.CartService;
import com.cafeteria.ventura.orders.security.config.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.instancio.Instancio;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;

@WebMvcTest(value = CartController.class)
@AutoConfigureMockMvc(addFilters = false) // omite todos los filtros de solicitudes
class CartControllerTest {


    @MockitoBean
    private JwtTokenProvider tokenProvider;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CartService cartService;

    @Test
    @WithMockUser(username = "ususaurio", roles = "USER")
    void addProduct_whenQuantityIsValid_shouldReturn200() throws Exception {
        AddProductRequest request = new AddProductRequest(1L, 1);

        when(cartService.addProduct(any(), any(), any()))
                .thenReturn(
                        Instancio.create(CartHasProductsEntity.class));

        this.mockMvc.perform(MockMvcRequestBuilders.post("/cart/addProduct")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk());
    }

    @Test
    @WithMockUser(username = "ususaurio", roles = "USER")
    void addProduct_whenQuantityIsInvalid_shouldThrow400() throws Exception {
        AddProductRequest request = new AddProductRequest(1L, 0);

        this.mockMvc.perform(MockMvcRequestBuilders.post("/cart/addProduct")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isBadRequest());

        verify(cartService, never()).addProduct(any(), any(), any());
    }

    @Test
    @WithMockUser(username = "ususaurio", roles = "USER")
    void getAllProducts_whenCartIsEmpty_shouldReuturn204() throws Exception {
        when(cartService.getAllProducts(anyString()))
                .thenReturn(List.of());

        mockMvc.perform(MockMvcRequestBuilders.get("/cart/getAllProducts")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isNoContent());
    }

    @Test
    @WithMockUser(username = "ususaurio", roles = "USER")
    void getAllProducts_whenCartIsFill_shouldReturn200() throws Exception {
        when(cartService.getAllProducts(anyString()))
                .thenReturn(List.of(Instancio.create(CartHasProductsEntity.class)));

        mockMvc.perform(MockMvcRequestBuilders.get("/cart/getAllProducts"))
                .andExpect(MockMvcResultMatchers.status().isOk());
    }

    @Test
    @WithMockUser(username = "ususaurio", roles = "USER")
    void deleteOneProduct_whenProductNotExistInCart_shouldThrow404() throws Exception {
        when(cartService.getProductById(any(), any()))
                .thenReturn(Optional.empty());

        DeleteProductRequest request = Instancio.create(DeleteProductRequest.class);

        mockMvc.perform(MockMvcRequestBuilders.post("/cart/deleteOneProduct")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isNotFound());
    }

    @Test
    @WithMockUser(username = "ususaurio", roles = "USER")
    void deleteOneProduct_whenProductExistInCart_shouldReturn200() throws Exception {
        when(cartService.getProductById(any(), any()))
                .thenReturn(
                        Optional.of(Instancio.create(CartHasProductsEntity.class)));

        when(cartService.deleteOneProduct(any()))
                .thenReturn(null);

        when(cartService.getAllProducts(anyString()))
                .thenReturn(List.of(Instancio.create(CartHasProductsEntity.class)));

        DeleteProductRequest request = Instancio.create(DeleteProductRequest.class);

        mockMvc.perform(MockMvcRequestBuilders.post("/cart/deleteOneProduct")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk());
    }
}