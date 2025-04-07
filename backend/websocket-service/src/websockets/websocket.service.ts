import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { PedidoSchema, Pedido, Result } from 'src/types';

@Injectable()
export class WebSocketService {
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  processMessage(data: unknown): Result {
    console.log('Procesando mensaje:\n', data);
    console.log('El cliente envía:\n', data);

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
}
