import { Test, TestingModule } from '@nestjs/testing';
import { PreferencesService } from './preferences.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Preference } from './entities/preference.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PreferencesService', () => {
  let service: PreferencesService;
  let repo: jest.Mocked<Repository<Preference>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreferencesService,
        {
          provide: getRepositoryToken(Preference),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PreferencesService>(PreferencesService);
    repo = module.get(getRepositoryToken(Preference));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create preferences if not existing', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue({ userId: 'u1', favoriteTone: 'pro' } as any);
      repo.save.mockResolvedValue({ userId: 'u1', favoriteTone: 'pro' } as any);
      const dto = { userId: 'u1', favoriteTone: 'pro' };
      const result = await service.create(dto as any);
      expect(result).toEqual({ userId: 'u1', favoriteTone: 'pro' });
    });
    it('should throw if preferences already exist', async () => {
      repo.findOne.mockResolvedValue({ userId: 'u1' } as any);
      await expect(
        service.create({ userId: 'u1', favoriteTone: 'pro' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByUserId', () => {
    it('should return preferences if found', async () => {
      repo.findOne.mockResolvedValue({
        userId: 'u1',
        favoriteTone: 'pro',
      } as any);
      expect(await service.findByUserId('u1')).toEqual({
        userId: 'u1',
        favoriteTone: 'pro',
      });
    });
    it('should throw if not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findByUserId('u1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateByUserId', () => {
    it('should update preferences if found', async () => {
      repo.findOne.mockResolvedValue({
        userId: 'u1',
        favoriteTone: 'pro',
      } as any);
      repo.save.mockResolvedValue({ userId: 'u1', favoriteTone: 'fun' } as any);
      const result = await service.updateByUserId('u1', {
        favoriteTone: 'fun',
      } as any);
      expect(result).toEqual({ userId: 'u1', favoriteTone: 'fun' });
    });
    it('should throw if not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(
        service.updateByUserId('u1', { favoriteTone: 'fun' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteByUserId', () => {
    it('should delete preferences if found', async () => {
      repo.delete.mockResolvedValue({ affected: 1 } as any);
      await expect(service.deleteByUserId('u1')).resolves.toBeUndefined();
    });
    it('should throw if not found', async () => {
      repo.delete.mockResolvedValue({ affected: 0 } as any);
      await expect(service.deleteByUserId('u1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
