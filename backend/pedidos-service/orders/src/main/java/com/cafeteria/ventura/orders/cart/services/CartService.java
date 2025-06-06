package com.cafeteria.ventura.orders.cart.services;

import com.cafeteria.ventura.orders.cart.models.CartEntity;
import com.cafeteria.ventura.orders.cart.models.CartHasProductsEntity;
import com.cafeteria.ventura.orders.cart.models.CartHasProductsId;
import com.cafeteria.ventura.orders.cart.repositories.CartHasProductsRepository;
import com.cafeteria.ventura.orders.cart.repositories.CartRepository;
import com.cafeteria.ventura.orders.exceptions.CustomException;
import com.cafeteria.ventura.orders.product.models.ProductEntity;
import com.cafeteria.ventura.orders.product.services.ProductService;
import com.cafeteria.ventura.orders.security.models.UserEntity;
import com.cafeteria.ventura.orders.security.services.UserEntityService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartHasProductsRepository cartHasProductsRepository;
    private final UserEntityService userEntityService;
    private final ProductService productService;

    /**
     * Añade un producto al carrito de un usuario
     *
     * @param username usuario
     * @param idProduct id del producto a añadir
     * @param quantity cantidad del producto
     * @return producto añadido al carrito con la cantidad actual
     * @throws CustomException si el id del producto es inválido
     */
    public CartHasProductsEntity addProduct(String username, Long idProduct, Integer quantity) throws CustomException {
        CartEntity cart = this.getCartByUsername(username);

        Optional<ProductEntity>optProduct = productService.getProductById(idProduct);
        if (optProduct.isEmpty()) { // el producto no existe en la db
            throw new CustomException("El producto a añadir no existe en la base de datos", HttpStatus.NOT_FOUND);
        }
        ProductEntity product = optProduct.get();

        CartHasProductsId cartHasProductsId = new CartHasProductsId(idProduct, cart.getIdCart());
        Optional<CartHasProductsEntity> optCartHasProductsEntity = cartHasProductsRepository.findById(cartHasProductsId);
        if (optCartHasProductsEntity.isPresent()) { // si ya existe este producto en mi carrito
            quantity += optCartHasProductsEntity.get().getQuantity();
        }

        return cartHasProductsRepository.save(
          CartHasProductsEntity.builder()
                  .id(cartHasProductsId)
                  .cart(cart)
                  .product(product)
                  .quantity(quantity)
                  .build()
        );
    }

    /**
     * Obtiene el carrito de un usuario
     *
     * @param username usuario
     * @return carrito del usuario
     * @throws CustomException si el usuario se ha borrado de la base de datos
     */
    public CartEntity getCartByUsername (String username) throws CustomException {
        Optional<UserEntity> optUserEntity = userEntityService.findByUsername(username);
        if (optUserEntity.isEmpty()) {
            throw new CustomException("Usuario no encontrado en la base de datos, vuelve a iniciar sesión", HttpStatus.FORBIDDEN);
        }
        UserEntity user = optUserEntity.get();

        Optional<CartEntity> optCartEntity = cartRepository.findByUser_idUser(user.getIdUser());

        return optCartEntity.orElseGet(() -> cartRepository.save( //nuevo carrito
                CartEntity.builder()
                        .user(user)
                        .build()
        ));
    }

    /**
     * Obtiene el carrito de un usuario
     *
     * @param user entidad del usuario de la base de datos
     * @return carrito del usuario
     */
    public CartEntity getCartByUserEntity (UserEntity user) {
        Optional<CartEntity> optCartEntity = cartRepository.findByUser_idUser(user.getIdUser());

        return optCartEntity.orElseGet(() -> cartRepository.save( //nuevo carrito
                CartEntity.builder()
                        .user(user)
                        .build()
        ));
    }

    /**
     * Obtiene todos los productos del carrito de un usuario
     *
     * @param username usuario
     * @return todos los productos de un carrito
     * @throws CustomException si el usuario se ha borrado de la base de datos
     */
    public List<CartHasProductsEntity> getAllProducts(String username) throws CustomException {
        CartEntity cart = this.getCartByUsername(username);
        return this.cartHasProductsRepository.findAllByCart(cart);
    }

    /**
     * Obtiene todos los productos del carrito de un usuario
     *
     * @param cart carrito del usuario
     * @return todos los productos del carrito
     */
    public List<CartHasProductsEntity> getAllProducts(CartEntity cart) {
        return this.cartHasProductsRepository.findAllByCart(cart);
    }

    /**
     * Obtiene un producto del carrito de un usuario por id del producto
     *
     * @param username usuario
     * @param idProduct id del producto
     * @return producto contenido en el carrito del usuario
     * @throws CustomException si no se encuentra ese producto en el carrito del usuario o es inválido
     */
    public Optional<CartHasProductsEntity> getProductById(String username, Long idProduct) throws CustomException {
        CartEntity cart = this.getCartByUsername(username);
        ProductEntity product = this.productService.getProductById(idProduct)
                .orElseThrow( () -> new CustomException("No se ha encontrado un producto con esta id", HttpStatus.NOT_FOUND));

        return this.cartHasProductsRepository.findByCartAndProduct(cart, product);
    }

    /**
     * Resta una unidad de producto del carrito de un usuario, si es la última unidad elimina el registro
     *
     * @param productInCart producto existente en el carrito del usuario
     * @return vacío si es el último registro, producto con la cantidad actualizada si no
     */
    public Optional<CartHasProductsEntity> deleteOneProduct(CartHasProductsEntity productInCart) {
        Integer quantity = productInCart.getQuantity();

        //si es el último elemento elimina el registro del carrito
        if (quantity <= 1) {
            this.cartHasProductsRepository.deleteById(productInCart.getId());
            return Optional.empty();
        }

        //si no es el último resta uno a la cantidad
        productInCart.setQuantity(quantity - 1);
        return Optional.of(this.cartHasProductsRepository.save(productInCart));
    }

    /**
     * Vacía un carrito de un usuario
     *
     * @param cart carrito
     */
    @Transactional
    public void clearCart(CartEntity cart) {
       this.cartHasProductsRepository.deleteByCart(cart);
    }

    /**
     * Elimina un producto del carrito de un usuario
     *
     * @param productInCart producto existente en el carrito del usuario
     */
    public void deleteAllQuantityProduct(CartHasProductsEntity productInCart) {
        this.cartHasProductsRepository.deleteById(productInCart.getId());
    }
}
