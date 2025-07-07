import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { WebhooksController } from './webhooks.controller';
import { GithubAppService } from './github-app.service';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Installation } from './entities/installation.entity';
import { Event } from './entities/event.entity';
import { Post } from './entities/post.entity';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Installation, Event, Post])],
  controllers: [GithubController, WebhooksController],
  providers: [GithubService, GithubAppService],
})
export class GithubModule {}
