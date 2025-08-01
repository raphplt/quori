import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DEFAULT_JWT_SECRET } from '../common/constants';
import { GithubController } from './github.controller';
import { WebhooksController } from './webhooks.controller';
import { GithubService } from './github.service';
import { GithubAppService } from './github-app.service';
import { GenerateService } from './services/generate.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { Installation } from './entities/installation.entity';
import { Event } from './entities/event.entity';
import { Post } from './entities/post.entity';
import { PreferencesModule } from '../preferences/preferences.module';
import { Template } from '../templates/entities/template.entity';
import { LinkedinModule } from '../linkedin/linkedin.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    TypeOrmModule.forFeature([Installation, Event, Post, Template]),
    PreferencesModule,
    LinkedinModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || DEFAULT_JWT_SECRET,
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [GithubController, WebhooksController],
  providers: [GithubService, GithubAppService, GenerateService],
  exports: [GenerateService],
})
export class GithubModule {}
