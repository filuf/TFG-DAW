import {
  WebSocketServer,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebSocketService } from './websocket.service';
import { OrdersArrayService } from 'src/components/ordersArraySingleton.service';

/**
 * Clase dedicada a configurar el Websocket y su funcionamiento
 */

@WebSocketGateway({
  // Cors del cliente React
  cors: {
    origin: '*', //TODO: Cambiar a la url cuando se defina donde esta el cliente
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly websocketService: WebSocketService,
    private readonly ordersArray: OrdersArrayService,
  ) {}

  afterInit(server: Server) {
    this.websocketService.setServer(server);
    // Verifica que el token JWT sea válido y tenga el rol de ADMIN
    server.use((socket, next) => {
      try {
        const valid = this.websocketService.verifyAdminJwt(socket);
        if (!valid) {
          return next(new Error('Authentication error'));
        }
        next();
      } catch (error) {
        next(new Error('Authentication error')); //error al cliente
      }
    });
  }

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
    //envía todos los componentes almacenados al iniciar
    setTimeout(() => {
      this.ordersArray
        .getOrders()
        .forEach((order) =>
          this.websocketService.processInitialMessage(client, order),
        );
    }, 1000);

    //TODO: SOLUCIONAR PROBLEMA ENVIO A TODOS LOS CLIENTES
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('removeOrder')
  handleRemoveOrder(@MessageBody() id: number) {
    return this.websocketService.processRemoveOrder(id);
  }
}
