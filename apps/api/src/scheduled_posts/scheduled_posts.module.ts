import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduledPostsService } from './scheduled_posts.service';
import { ScheduledPostsController } from './scheduled_posts.controller';
import { ScheduledPost } from './entities/scheduled_post.entity';
import { ScheduledPostsScheduler } from './scheduler.service';
import { Post } from '../github/entities/post.entity';
import { GithubModule } from '../github/github.module';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduledPost, Post]), GithubModule],
  controllers: [ScheduledPostsController],
  providers: [ScheduledPostsService, ScheduledPostsScheduler],
})
export class ScheduledPostsModule {}
