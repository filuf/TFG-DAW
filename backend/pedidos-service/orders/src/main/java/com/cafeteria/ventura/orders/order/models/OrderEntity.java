package com.cafeteria.ventura.orders.order.models;

import com.cafeteria.ventura.orders.security.models.UserEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_order")
    private Long id;

    //se crea una tabla aparte (esta tabla se carga cuando cargues al orderEntity)
    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "order_states", joinColumns = @JoinColumn(name = "id_order"))
    private List<OrderState> states = new ArrayList<>(); //lista de roles

    @ManyToOne
    @JoinColumn(name = "id_user")
    private UserEntity user;

    @Column(length = 300)
    private String description;

    @Column(name = "is_paid")
    private boolean isPaid;

    //relación con la tabla intermedia para poder usar @EntityGraph
    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY)
    private List<OrderHasProductsEntity> orderHasProducts;

}
