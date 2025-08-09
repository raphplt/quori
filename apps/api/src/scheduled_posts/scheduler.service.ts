import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CronJob } from 'cron';
import { ScheduledPostsService } from './scheduled_posts.service';

@Injectable()
export class ScheduledPostsScheduler implements OnModuleInit {
  private readonly logger = new Logger(ScheduledPostsScheduler.name);
  private job?: CronJob;

  constructor(private readonly service: ScheduledPostsService) {}

  onModuleInit() {
    // Run every minute
    this.job = new CronJob('* * * * *', () => {
      void this.handleTick();
    });
    this.job.start();
    this.logger.log('ScheduledPostsScheduler started (every minute)');
  }

  private async handleTick() {
    this.logger.debug('ScheduledPostsScheduler tick');
    await this.service.markPendingDue();
  }
}
