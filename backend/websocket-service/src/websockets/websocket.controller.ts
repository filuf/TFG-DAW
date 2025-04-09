import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { WebSocketService } from './websocket.service';
import { Result } from 'src/types';

/**
 * Este controlador recibe json con objetos Pedido
 * Se apoya en el servicio para validar la lógica y enviar a React
 */

@Controller('websocket')
export class WebsocketController {
  constructor(private readonly websocketService: WebSocketService) {}

  @Post('emit')
  emitMessage(@Body() data: unknown) {
    const result: Result = this.websocketService.processMessage(data);

    if (!result.success) {
      throw new HttpException(result.error as string, HttpStatus.BAD_REQUEST); // 400
    }

    return {
      statusCode: HttpStatus.OK,
      data: result,
    }; // 200
  }
}
