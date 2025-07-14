import { Test, TestingModule } from '@nestjs/testing';
import { PreferencesController } from './preferences.controller';
import { PreferencesService } from './preferences.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PreferencesController', () => {
  let controller: PreferencesController;
  let service: jest.Mocked<PreferencesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreferencesController],
      providers: [
        {
          provide: PreferencesService,
          useValue: {
            create: jest.fn(),
            findByUserId: jest.fn(),
            updateByUserId: jest.fn(),
            deleteByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PreferencesController>(PreferencesController);
    service = module.get(PreferencesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create preferences', async () => {
    service.create.mockResolvedValue({
      userId: 'u1',
      favoriteTone: 'pro',
    } as any);
    expect(
      await controller.create({ userId: 'u1', favoriteTone: 'pro' } as any),
    ).toEqual({ userId: 'u1', favoriteTone: 'pro' });
  });

  it('should get preferences by userId', async () => {
    service.findByUserId.mockResolvedValue({
      userId: 'u1',
      favoriteTone: 'pro',
    } as any);
    expect(await controller.findByUserId('u1')).toEqual({
      userId: 'u1',
      favoriteTone: 'pro',
    });
  });

  it('should update preferences by userId', async () => {
    service.updateByUserId.mockResolvedValue({
      userId: 'u1',
      favoriteTone: 'fun',
    } as any);
    expect(
      await controller.updateByUserId('u1', { favoriteTone: 'fun' } as any),
    ).toEqual({ userId: 'u1', favoriteTone: 'fun' });
  });

  it('should delete preferences by userId', async () => {
    service.deleteByUserId.mockResolvedValue(undefined);
    await expect(controller.deleteByUserId('u1')).resolves.toBeUndefined();
  });

  it('should propagate service errors', async () => {
    service.create.mockRejectedValue(new BadRequestException('err'));
    await expect(
      controller.create({ userId: 'u1', favoriteTone: 'pro' } as any),
    ).rejects.toThrow(BadRequestException);
    service.findByUserId.mockRejectedValue(new NotFoundException('err'));
    await expect(controller.findByUserId('u1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
