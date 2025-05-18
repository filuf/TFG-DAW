package com.cafeteria.ventura.orders.order.models;

import com.cafeteria.ventura.orders.security.models.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
public class OrderEntity {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_order")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "state")
    private OrderState state;

    @ManyToOne
    @JoinColumn(name = "id_user")
    private UserEntity user;

    @Column(length = 300)
    private String description;

    @Column(name = "is_paid")
    private boolean isPaid;

    //relación con la tabla intermedia para poder usar @EntityGraph
    //uso de cascada en vez de repo intermedio como en carrito debido a que la inserción de productos es atómica
    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<OrderHasProductsEntity> orderHasProducts;

}
