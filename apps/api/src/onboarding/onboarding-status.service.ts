import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingStatusEntity } from './onboarding-status.entity';

@Injectable()
export class OnboardingStatusService {
  constructor(
    @InjectRepository(OnboardingStatusEntity)
    private readonly onboardingRepo: Repository<OnboardingStatusEntity>,
  ) {}

  async getByUserId(userId: string): Promise<OnboardingStatusEntity | null> {
    return this.onboardingRepo.findOne({ where: { user: { id: userId } } });
  }

  async updateStep(
    userId: string,
    step: number,
  ): Promise<OnboardingStatusEntity> {
    let onboarding = await this.getByUserId(userId);
    if (!onboarding) {
      onboarding = this.onboardingRepo.create({ step, user: { id: userId } });
      onboarding.startedAt = new Date();
    } else {
      onboarding.step = step;
    }
    return this.onboardingRepo.save(onboarding);
  }

  async markFinished(userId: string): Promise<OnboardingStatusEntity> {
    let onboarding = await this.getByUserId(userId);
    if (!onboarding) {
      onboarding = this.onboardingRepo.create({
        step: 5,
        finished: true,
        user: { id: userId },
      });
      onboarding.startedAt = new Date();
    }
    onboarding.finished = true;
    onboarding.completedAt = new Date();
    onboarding.step = 5;
    return this.onboardingRepo.save(onboarding);
  }

  async skipOnboarding(userId: string): Promise<OnboardingStatusEntity> {
    let onboarding = await this.getByUserId(userId);
    if (!onboarding) {
      onboarding = this.onboardingRepo.create({
        step: 5,
        finished: true,
        user: { id: userId },
      });
      onboarding.startedAt = new Date();
    }
    onboarding.finished = true;
    onboarding.completedAt = new Date();
    onboarding.step = 5;
    return this.onboardingRepo.save(onboarding);
  }
}
