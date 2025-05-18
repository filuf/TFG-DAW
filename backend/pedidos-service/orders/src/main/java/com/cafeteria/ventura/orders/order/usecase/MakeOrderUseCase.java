package com.cafeteria.ventura.orders.order.usecase;

import com.cafeteria.ventura.orders.exceptions.CustomException;
import com.cafeteria.ventura.orders.order.dto.OrderDTO;

public interface MakeOrderUseCase {

    public OrderDTO makeOrder(String username, String description) throws CustomException;
}
