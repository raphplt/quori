import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CronJob } from 'cron';
import { ScheduledPostsService } from './scheduled_posts.service';

@Injectable()
export class ScheduledPostsScheduler implements OnModuleInit {
  private readonly logger = new Logger(ScheduledPostsScheduler.name);
  private job?: CronJob;

  constructor(private readonly service: ScheduledPostsService) {}

  onModuleInit() {
    this.job = new CronJob('*/5 * * * *', () => this.handleTick());
    this.job.start();
    this.logger.log('ScheduledPostsScheduler started');
  }

  private async handleTick() {
    await this.service.markPendingDue();
  }
}
