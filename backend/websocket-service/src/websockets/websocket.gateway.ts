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
    origin: 'http://localhost:5173',
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
  }

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
    //envía todos los componentes almacenados al iniciar
    this.ordersArray
      .getOrders()
      .forEach((order) =>
        this.websocketService.processInitialMessage(client, order),
      );
    //TODO: SOLUCIONAR PROBLEMA ENVIO A TODOS LOS CLIENTES
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  //deprecar
  @SubscribeMessage('mensaje')
  handleMessage(@MessageBody() data: unknown) {
    return this.websocketService.processMessage(data);
  }

  @SubscribeMessage('removeOrder')
  handleRemoveOrder(@MessageBody() id: number) {
    return this.websocketService.processRemoveOrder(id);
  }
}
