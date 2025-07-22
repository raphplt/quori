import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledPostsController } from './scheduled_posts.controller';
import { ScheduledPostsService } from './scheduled_posts.service';

describe('ScheduledPostsController', () => {
  let controller: ScheduledPostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduledPostsController],
      providers: [ScheduledPostsService],
    }).compile();

    controller = module.get<ScheduledPostsController>(ScheduledPostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
