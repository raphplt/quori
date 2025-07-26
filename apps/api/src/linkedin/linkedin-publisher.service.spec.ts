import { Test, TestingModule } from '@nestjs/testing';
import { LinkedinPublisherService } from './linkedin-publisher.service';
import { LinkedinAuthService } from '../linkedin-auth/linkedin-auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../github/entities/post.entity';
import { LinkedInApi } from './linkedin.api';

describe('LinkedinPublisherService', () => {
  let service: LinkedinPublisherService;
  const repo = {
    findOne: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<Repository<Post>>;
  const auth = { getToken: jest.fn() } as unknown as jest.Mocked<LinkedinAuthService>;
  const api = { createPost: jest.fn() } as jest.Mocked<LinkedInApi>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkedinPublisherService,
        { provide: getRepositoryToken(Post), useValue: repo },
        { provide: LinkedinAuthService, useValue: auth },
        { provide: 'LinkedInApi', useValue: api },
      ],
    }).compile();
    service = module.get(LinkedinPublisherService);
  });

  it('publishes and updates status', async () => {
    repo.findOne.mockResolvedValue({ id: 1, postContent: 'hi', statusLinkedin: 'pending' } as any);
    auth.getToken.mockResolvedValue('tok');
    api.createPost.mockResolvedValue({ id: 'abc' });

    await service.publish('u1', 1);

    expect(api.createPost).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ statusLinkedin: 'published', externalId: 'abc' }));
  });
});
