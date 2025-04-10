import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { OrdersArrayService } from 'src/components/ordersArraySingleton.service';
import { PedidoSchema, Pedido, Result } from 'src/types';
import { number } from 'zod';

/**
 * Este servicio maneja el contenido de los Post para ver si son componentes bien formados
 * y en ese caso mandarselo a react
 */
@Injectable()
export class WebSocketService {
  private server: Server; //conexion websocket

  //no puede estar en el builder porque server no está disponible instantaneamente al iniciar
  setServer(server: Server) {
    this.server = server;
  }

  constructor(private readonly ordersArray: OrdersArrayService) {}

  processMessage(data: unknown): Result {
    console.log('Procesando mensaje:\n', data);

    try {
      const message: Pedido = PedidoSchema.parse(data);
      this.server.emit('mensajeServer', message);
      this.ordersArray.addOrder(message);
      return { success: true } as Result;
    } catch (error: unknown) {
      console.error('Error al procesar el mensaje:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage } as Result;
    }
  }

  processRemoveOrder(id: number): Result {
    console.log('procesando pedido concluido:\nID:', id);

    //hacer query a db actualizando el estado
    this.server.emit('removeOrderServer', id);
    this.ordersArray.removerOrderById(id);
    return { success: true } as Result;
  }

  processInitialMessage(client: Socket, order: unknown) {
    console.log('Procesando mensaje inicial:\n', order);

    try {
      const message: Pedido = PedidoSchema.parse(order);
      client.emit('mensajeServer', message);
      return { success: true } as Result;
    } catch (error: unknown) {
      console.error('Error al procesar el mensaje:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage } as Result;
    }
  }
}
