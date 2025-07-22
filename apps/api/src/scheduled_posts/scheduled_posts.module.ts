import { Module } from '@nestjs/common';
import { ScheduledPostsService } from './scheduled_posts.service';
import { ScheduledPostsController } from './scheduled_posts.controller';

@Module({
  controllers: [ScheduledPostsController],
  providers: [ScheduledPostsService],
})
export class ScheduledPostsModule {}
