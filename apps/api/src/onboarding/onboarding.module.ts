import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingStatusEntity } from './onboarding-status.entity';
import { OnboardingStatusService } from './onboarding-status.service';
import { OnboardingStatusController } from './onboarding-status.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OnboardingStatusEntity])],
  providers: [OnboardingStatusService],
  controllers: [OnboardingStatusController],
  exports: [OnboardingStatusService],
})
export class OnboardingModule {}
