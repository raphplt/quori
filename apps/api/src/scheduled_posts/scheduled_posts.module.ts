import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduledPostsService } from './scheduled_posts.service';
import { ScheduledPostsController } from './scheduled_posts.controller';
import { ScheduledPost } from './entities/scheduled_post.entity';
import { ScheduledPostsScheduler } from './scheduler.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduledPost])],
  controllers: [ScheduledPostsController],
  providers: [ScheduledPostsService, ScheduledPostsScheduler],
})
export class ScheduledPostsModule {}
