import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Server, Socket } from 'socket.io';
import { OrdersArrayService } from 'src/components/ordersArraySingleton.service';
import { ConfigService } from '@nestjs/config';
import {
  PedidoSchema,
  Pedido,
  Result,
  JwtUserDetailsAuthorities,
} from 'src/types';
import * as jwt from 'jsonwebtoken';

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

  constructor(
    private readonly ordersArray: OrdersArrayService,
    private configService: ConfigService,
  ) {}

  verifySystemJwt(request: FastifyRequest): boolean {
    //extraer el token del header
    const token = request.headers['authorization']?.split(' ')[1];
    if (!token) {
      return false;
    }

    //verificar la clave secreta
    const secret = this.configService.get<string>('VITE_JWT_SECRET'); //TODO: NO FUNCIONA ESTA MIERDA :()
    if (!secret) {
      throw new Error('Clave secreta de JWT no definida');
    }

    //verificar el token
    let tokenData: JwtUserDetailsAuthorities;
    try {
      tokenData = jwt.verify(token, secret) as JwtUserDetailsAuthorities;
    } catch (err) {
      console.error('Token inválido:', err);
      return false;
    }

    return (
      tokenData.authorities?.some((authority) => authority === 'SYSTEM') ??
      false
    );
  }

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
