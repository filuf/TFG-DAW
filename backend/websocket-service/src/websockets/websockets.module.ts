import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { WebsocketController } from './websocket.controller';
import { OrdersArrayService } from 'src/components/ordersArraySingleton.service';

@Module({
  providers: [WebsocketGateway, WebSocketService, OrdersArrayService],
  controllers: [WebsocketController],
})
export class GatewayModule {}
