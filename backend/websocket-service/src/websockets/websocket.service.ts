import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { PedidoSchema, Pedido, Result } from 'src/types';

/**
 * Este servicio maneja el contenido de los Post para ver si son componentes bien formados
 * y en ese caso mandarselo a react
 */
@Injectable()
export class WebSocketService {
  private server: Server; //conexion websocket

  setServer(server: Server) {
    this.server = server;
  }

  processMessage(data: unknown): Result {
    console.log('Procesando mensaje:\n', data);

    try {
      const message: Pedido = PedidoSchema.parse(data);
      this.server.emit('mensajeServer', message);
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
    return { success: true } as Result;
  }
}
