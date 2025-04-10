import { Injectable } from '@nestjs/common';
import { Pedido } from 'src/types';

/**
 * Singleton de un array de Pedidos
 * Recibe pedidos bien formados
 */

@Injectable()
export class OrdersArrayService {
  private orders: Pedido[] = [];

  getOrders() {
    console.log('contenido del array:\n', this.orders);
    return this.orders;
  }

  addOrder(order: Pedido) {
    this.orders.push(order);
  }

  removerOrderById(id: number) {
    this.orders = this.orders.filter((order) => order.id != id);
  }
}
