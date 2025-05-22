import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { WebSocketService } from './websocket.service';
import { Result } from 'src/types';
import { FastifyRequest } from 'fastify';

/**
 * Este controlador recibe json con objetos Pedido
 * Se apoya en el servicio para validar la lógica y enviar a React
 */

@Controller('websocket')
export class WebsocketController {
  constructor(private readonly websocketService: WebSocketService) {}

  @Post('emit')
  @HttpCode(HttpStatus.OK)
  emitMessage(@Req() request: FastifyRequest, @Body() data: unknown) {
    // Verificar el JWT
    if (!this.websocketService.verifySystemJwt(request)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED); // 401
    }
    const result: Result = this.websocketService.processMessage(data);

    if (!result.success) {
      throw new HttpException(result.error as string, HttpStatus.BAD_REQUEST); // 400
    }

    return {
      data: result,
    };
  }
}
