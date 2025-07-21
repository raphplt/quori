import { Controller, Get, Patch, Post, Param, Body } from '@nestjs/common';
import { OnboardingStatusService } from './onboarding-status.service';

class UpdateStepDto {
  step: number;
}

@Controller('onboarding-status')
export class OnboardingStatusController {
  constructor(private readonly onboardingService: OnboardingStatusService) {}

  @Get(':userId')
  async getStatus(@Param('userId') userId: string) {
    return this.onboardingService.getByUserId(userId);
  }

  @Patch(':userId/step')
  async updateStep(
    @Param('userId') userId: string,
    @Body() dto: UpdateStepDto,
  ) {
    return this.onboardingService.updateStep(userId, dto.step);
  }

  @Post(':userId/finish')
  async finish(@Param('userId') userId: string) {
    return this.onboardingService.markFinished(userId);
  }
}
