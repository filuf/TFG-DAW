package com.cafeteria.ventura.orders.cart.models;

import com.cafeteria.ventura.orders.security.models.UserEntity;
import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Table(name = "cart")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cart")
    private Long idCart;

    @ManyToOne
    @JoinColumn(name = "id_user")
    private UserEntity user;

}
