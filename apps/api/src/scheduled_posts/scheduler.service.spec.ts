import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledPostsScheduler } from './scheduler.service';
import { ScheduledPostsService } from './scheduled_posts.service';
import { CronJob } from 'cron';

jest.mock('cron', () => ({ CronJob: jest.fn().mockImplementation((_expr, fn) => ({ start: jest.fn(), fn })) }));

describe('ScheduledPostsScheduler', () => {
  let scheduler: ScheduledPostsScheduler;
  let service: ScheduledPostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduledPostsScheduler,
        { provide: ScheduledPostsService, useValue: { markPendingDue: jest.fn() } },
      ],
    }).compile();
    scheduler = module.get(ScheduledPostsScheduler);
    service = module.get(ScheduledPostsService);
  });

  it('starts cron job on init and calls markPendingDue', async () => {
    const job: any = (scheduler as any).job;
    expect(job).toBeUndefined();
    await scheduler.onModuleInit();
    expect(CronJob).toHaveBeenCalled();
    const createdJob = (scheduler as any).job;
    expect(createdJob.start).toHaveBeenCalled();
    await createdJob.fn();
    expect(service.markPendingDue).toHaveBeenCalled();
  });
});
