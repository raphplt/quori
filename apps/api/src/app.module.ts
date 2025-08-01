import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GithubModule } from './github/github.module';
import { QuotaModule } from './quota/quota.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferencesModule } from './preferences/preferences.module';
import { TemplatesModule } from './templates/templates.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { ScheduledPostsModule } from './scheduled_posts/scheduled_posts.module';
import { LinkedinAuthModule } from './linkedin-auth/linkedin-auth.module';
import { LinkedinModule } from './linkedin/linkedin.module';
import * as Joi from 'joi';

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
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3001),
        DATABASE_URL: Joi.string().required(),
        SESSION_SECRET: Joi.string().optional(),
        FRONTEND_URL: Joi.string().optional(),
        JWT_SECRET: Joi.string().when('NODE_ENV', {
          is: 'production',
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
        GITHUB_CLIENT_ID: Joi.string().when('NODE_ENV', {
          is: 'production',
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
        GITHUB_CLIENT_SECRET: Joi.string().when('NODE_ENV', {
          is: 'production',
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
        GITHUB_WEBHOOK_SECRET: Joi.string().when('NODE_ENV', {
          is: 'production',
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
        GITHUB_APP_ID: Joi.string().when('NODE_ENV', {
          is: 'production',
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
        GITHUB_APP_PRIVATE_KEY: Joi.string().optional(),
        GITHUB_APP_PRIVATE_KEY_PATH: Joi.string().optional(),
        OPENAI_API_KEY: Joi.string().when('NODE_ENV', {
          is: 'production',
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
        LINKEDIN_CLIENT_ID: Joi.string().optional(),
        LINKEDIN_CLIENT_SECRET: Joi.string().optional(),
        LINKEDIN_REDIRECT_URI: Joi.string().optional(),
        REDIS_URL: Joi.string().optional(),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
      {
        ttl: 3600000,
        limit: 1200,
      },
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const isProduction = config.get('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          url: config.get<string>('DATABASE_URL'),
          autoLoadEntities: true,
          synchronize: true,
          // logging: config.get('NODE_ENV') === 'development',
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
    OnboardingModule,
    ScheduledPostsModule,
    LinkedinAuthModule,
    LinkedinModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
