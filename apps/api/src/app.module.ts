import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GithubModule } from './github/github.module';
import { QuotaModule } from './quota/quota.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferencesModule } from './preferences/preferences.module';
import { TemplatesModule } from './templates/templates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env.local',
        '.env',
      ],
      cache: true,
      expandVariables: true,
      validationSchema: {
        type: 'object',
        required: ['DATABASE_URL'],
        properties: {
          NODE_ENV: {
            type: 'string',
            enum: ['development', 'production', 'test'],
            default: 'development',
          },
          PORT: {
            type: 'number',
            default: 3001,
          },
          DATABASE_URL: {
            type: 'string',
          },
          SESSION_SECRET: {
            type: 'string',
          },
          FRONTEND_URL: {
            type: 'string',
          },
        },
      },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const isProduction = config.get('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          url: config.get<string>('DATABASE_URL'),
          autoLoadEntities: true,
          synchronize: !isProduction,
          logging: config.get('NODE_ENV') === 'development',
          ssl: isProduction ? { rejectUnauthorized: false } : false,
          extra: {
            connectionLimit: 10,
            acquireTimeout: 60000,
            timeout: 60000,
          },
          ...(isProduction && {
            pool: {
              min: 2,
              max: 10,
              acquireTimeoutMillis: 30000,
              createTimeoutMillis: 30000,
              destroyTimeoutMillis: 5000,
              idleTimeoutMillis: 30000,
              reapIntervalMillis: 1000,
              createRetryIntervalMillis: 100,
            },
          }),
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    GithubModule,
    QuotaModule,
    PreferencesModule,
    TemplatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
