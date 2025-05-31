package com.cafeteria.ventura.orders.cart.services;

import com.cafeteria.ventura.orders.cart.models.CartEntity;
import com.cafeteria.ventura.orders.cart.models.CartHasProductsEntity;
import com.cafeteria.ventura.orders.cart.repositories.CartHasProductsRepository;
import com.cafeteria.ventura.orders.cart.repositories.CartRepository;
import com.cafeteria.ventura.orders.exceptions.CustomException;
import com.cafeteria.ventura.orders.product.models.ProductEntity;
import com.cafeteria.ventura.orders.product.services.ProductService;
import com.cafeteria.ventura.orders.security.models.UserEntity;
import com.cafeteria.ventura.orders.security.services.UserEntityService;
import org.instancio.Instancio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    private CartService cartService;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartHasProductsRepository cartHasProductsRepository;

    @Mock
    private UserEntityService userEntityService;

    @Mock
    private ProductService productService;

    @BeforeEach
    void setUp() {
        cartService = spy(new CartService(cartRepository, cartHasProductsRepository, userEntityService, productService));
    }


    @Test
    void addProduct_whenProductNotExistInDB_shouldThrow404() throws CustomException {
        doReturn(Instancio.create(CartEntity.class))
                .when(cartService)
                .getCartByUsername(any());

        when(productService.getProductById(any()))
                .thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class,
                () -> cartService.addProduct("", -1L, 1));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void addProduct_whenProductNotExistInCart_shouldCreateWithQuantity() throws CustomException {

        doReturn(Instancio.create(CartEntity.class))
                .when(cartService)
                .getCartByUsername(any());

        when(productService.getProductById(any()))
                .thenReturn(Optional.of(new ProductEntity()));

        when(cartHasProductsRepository.findById(any()))
                .thenReturn(
                        Optional.empty());

        int quantity = 2;

        // devuelve el primer parámetro proporcionado, en este caso el objeto que se le pasa a save()
        when(cartHasProductsRepository.save(any()))
                .thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));

        CartHasProductsEntity objectReturned = cartService.addProduct("", -1L, quantity);

        assertEquals(quantity, objectReturned.getQuantity());
    }

    @Test
    void addProduct_whenProductExistInCart_shouldSumQuantity() throws CustomException {

        doReturn(Instancio.create(CartEntity.class))
                .when(cartService)
                .getCartByUsername(any());

        when(productService.getProductById(any()))
                .thenReturn(Optional.of(new ProductEntity()));

        CartHasProductsEntity cartHasProductsEntity = CartHasProductsEntity.builder()
                .quantity(5)
                .build();

        when(cartHasProductsRepository.findById(any()))
                .thenReturn(
                        Optional.of(cartHasProductsEntity));

        int quantity = 2;

        // devuelve el primer parámetro proporcionado, en este caso el objeto que se le pasa a save()
        when(cartHasProductsRepository.save(any()))
                .thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));

        CartHasProductsEntity objectReturned = cartService.addProduct("", -1L, quantity);

        assertEquals(7, objectReturned.getQuantity());
    }

    @Test
    void getCartByUsername_whenUserNotExist_shouldThrow403() {
        when(userEntityService.findByUsername(any()))
                .thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class,
                () -> cartService.getCartByUsername(""));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    @Test
    void getCartByUsername_whenCartExist_shouldReturnExistingCart() throws CustomException {
        when(userEntityService.findByUsername(any()))
                .thenReturn(Optional.of(Instancio.create(UserEntity.class)));

        when(cartRepository.findByUser_idUser(any()))
                .thenReturn(Optional.of(Instancio.create(CartEntity.class)));

        cartService.getCartByUsername("");
        verify(cartRepository, never()).save(any());
    }

    @Test
    void getCartByUsername_whenCartExist_shouldReturnNewCart() throws CustomException {
        when(userEntityService.findByUsername(any()))
                .thenReturn(Optional.of(Instancio.create(UserEntity.class)));

        when(cartRepository.findByUser_idUser(any()))
                .thenReturn(Optional.empty());

        when(cartRepository.save(any()))
                .thenReturn(Instancio.create(CartEntity.class));

        cartService.getCartByUsername("");
        verify(cartRepository, times(1)).save(any());
    }

    @Test
    void getCartByUserEntity_whenCartExist_shouldReturnExistingCart() {
        when(cartRepository.findByUser_idUser(any()))
                .thenReturn(Optional.of(new CartEntity()));

        cartService.getCartByUserEntity(new UserEntity());
        verify(cartRepository, times(0)).save(any());
    }

    @Test
    void getCartByUserEntity_whenCartExist_shouldReturnNewCart() {
        when(cartRepository.findByUser_idUser(any()))
                .thenReturn(Optional.empty());

        when(cartRepository.save(any()))
                .thenReturn(Instancio.create(CartEntity.class));

        cartService.getCartByUserEntity(new UserEntity());
        verify(cartRepository, times(1)).save(any());
    }

    @Test
    void getAllProductsUsername() throws CustomException {
        doReturn(new CartEntity())
                .when(cartService)
                .getCartByUsername(anyString());
        when(cartHasProductsRepository.findAllByCart(any()))
                .thenReturn(List.of());

        cartService.getAllProducts("");
        verify(cartHasProductsRepository, times(1)).findAllByCart(any());
    }

    @Test
    void getAllProductsCart() {

        when(cartHasProductsRepository.findAllByCart(any()))
                .thenReturn(List.of());

        cartService.getAllProducts(new CartEntity());
        verify(cartHasProductsRepository, times(1)).findAllByCart(any());
    }

    @Test
    void getProductById_whenProductNotExist_shouldReturn404() throws CustomException {
        doReturn(new CartEntity())
                .when(cartService)
                .getCartByUsername(anyString());
        when(productService.getProductById(any()))
                .thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class,
                () -> cartService.getProductById("", -1L));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void getProductById_whenProductExist_shouldReturnOptionalCartHasProduct() throws CustomException {
        doReturn(new CartEntity())
                .when(cartService)
                .getCartByUsername(anyString());
        when(productService.getProductById(any()))
                .thenReturn(Optional.of(new ProductEntity()));
        when(cartHasProductsRepository.findByCartAndProduct(any(),any()))
                .thenReturn(Optional.of(new CartHasProductsEntity()));

        cartService.getProductById("", -1L);
        verify(cartHasProductsRepository, times(1)).findByCartAndProduct(any(),any());
    }

    @ParameterizedTest
    @ValueSource(ints = {1,0,-1})
    void deleteOneProduct_whenQuantityIsOneOrLess_shouldReturnOptionalEmpty(int quantity) {

        doNothing()
                .when(cartHasProductsRepository)
                .deleteById(any());

        cartService.deleteOneProduct(CartHasProductsEntity.builder()
                .quantity(quantity)
                .build());
        verify(cartHasProductsRepository, times(1))
                .deleteById(any());
    }

    @Test
    void deleteOneProduct_whenQuantityIsMoreThanOne_shouldReturnOptionalCartHasProducts() {

        when(cartHasProductsRepository.save(any()))
                .thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));

        Optional<CartHasProductsEntity> optCart = cartService.deleteOneProduct(CartHasProductsEntity.builder()
                .quantity(2)
                .build());

        assertTrue(optCart.isPresent());

        assertEquals(1, optCart.get().getQuantity());
        verify(cartHasProductsRepository, times(1))
                .save(any());
    }

    @Test
    void clearCart() {
        doNothing()
                .when(cartHasProductsRepository)
                .deleteByCart(any());

        cartService.clearCart(new CartEntity());
        verify(cartHasProductsRepository, times(1))
                .deleteByCart(any());
    }
}