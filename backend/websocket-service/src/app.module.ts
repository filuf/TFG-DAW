import { Module } from '@nestjs/common';
import { GatewayModule } from './websockets/websockets.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    GatewayModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
