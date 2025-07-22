import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledPostsService } from './scheduled_posts.service';

describe('ScheduledPostsService', () => {
  let service: ScheduledPostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduledPostsService],
    }).compile();

    service = module.get<ScheduledPostsService>(ScheduledPostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
