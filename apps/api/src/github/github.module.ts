import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { WebhooksController } from './webhooks.controller';
import { GithubAppService } from './github-app.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [GithubController, WebhooksController],
  providers: [GithubService, GithubAppService],
})
export class GithubModule {}
