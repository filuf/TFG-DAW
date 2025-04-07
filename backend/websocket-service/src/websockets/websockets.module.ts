import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { WebsocketController } from './websocket.controller';

@Module({
  providers: [WebsocketGateway, WebSocketService],
  controllers: [WebsocketController],
})
export class GatewayModule {}
