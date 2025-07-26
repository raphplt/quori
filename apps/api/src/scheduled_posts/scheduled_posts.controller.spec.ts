import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledPostsController } from './scheduled_posts.controller';
import { ScheduledPostsService } from './scheduled_posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScheduledPost } from './entities/scheduled_post.entity';

describe('ScheduledPostsController', () => {
  let controller: ScheduledPostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduledPostsController],
      providers: [
        ScheduledPostsService,
        { provide: getRepositoryToken(ScheduledPost), useValue: {} },
      ],
    }).compile();

    controller = module.get<ScheduledPostsController>(ScheduledPostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
