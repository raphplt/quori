import { Test, TestingModule } from '@nestjs/testing';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';

describe('GithubController', () => {
  let controller: GithubController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GithubController],
      providers: [
        GithubService,
        { provide: UsersService, useValue: {} },
        { provide: getRepositoryToken(Event), useValue: {} },
      ],
    }).compile();

    controller = module.get<GithubController>(GithubController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
