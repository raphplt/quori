import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledPostsService } from './scheduled_posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScheduledPost, ScheduledPostStatus } from './entities/scheduled_post.entity';
import { Repository } from 'typeorm';

describe('ScheduledPostsService', () => {
  let service: ScheduledPostsService;
  let repo: jest.Mocked<Repository<ScheduledPost>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduledPostsService,
        {
          provide: getRepositoryToken(ScheduledPost),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ScheduledPostsService>(ScheduledPostsService);
    repo = module.get(getRepositoryToken(ScheduledPost));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('markPendingDue', () => {
    it('marks scheduled posts in the past as pending', async () => {
      const old = { id: '1', scheduled_at: new Date(Date.now() - 1000), status: ScheduledPostStatus.SCHEDULED } as ScheduledPost;
      repo.find.mockResolvedValue([old]);
      repo.save.mockResolvedValue({ ...old, status: ScheduledPostStatus.PENDING } as ScheduledPost);

      await service.markPendingDue();

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ status: ScheduledPostStatus.PENDING }));
    });
  });
});
