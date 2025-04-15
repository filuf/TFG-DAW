package com.cafeteria.ventura.orders.product.services;

import com.cafeteria.ventura.orders.product.models.ProductEntity;
import com.cafeteria.ventura.orders.product.repositories.ProductRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@AllArgsConstructor
@Service
public class ProductService {
    private final ProductRepository productRepository;

    public Optional<ProductEntity> getProductById(Long idProduct) {
        return productRepository.findById(idProduct);
    }
}
