import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { WebhooksController } from './webhooks.controller';
import { GithubAppService } from './github-app.service';
import { GenerateService } from './services/generate.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Installation } from './entities/installation.entity';
import { Event } from './entities/event.entity';
import { Post } from './entities/post.entity';
import { PreferencesModule } from '../preferences/preferences.module';
import { Template } from '../templates/entities/template.entity';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    TypeOrmModule.forFeature([Installation, Event, Post, Template]),
    PreferencesModule,
  ],
  controllers: [GithubController, WebhooksController],
  providers: [GithubService, GithubAppService, GenerateService],
  exports: [GenerateService],
})
export class GithubModule {}
