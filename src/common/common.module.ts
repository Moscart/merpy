import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { CacheService } from './cache/cache.service';
import appConfig from './configs/app.config';
import jwtConfig from './configs/jwt.config';
import redisConfig from './configs/redis.config';
import { PrismaService } from './database/prisma.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, redisConfig],
      cache: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 20,
        },
      ],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        name: 'Merpy',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
          },
        },
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
      },
    }),
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
      },
    }),
  ],
  providers: [PrismaService, CacheService],
  exports: [PrismaService, CacheService],
})
export class CommonModule {}
