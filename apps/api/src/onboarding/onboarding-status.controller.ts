import { Controller, Get, Patch, Post, Param, Body } from '@nestjs/common';
import { OnboardingStatusService } from './onboarding-status.service';
import { IsInt, Min } from 'class-validator';

class UpdateStepDto {
  @IsInt()
  @Min(1)
  step: number;
}

@Controller('onboarding-status')
export class OnboardingStatusController {
  constructor(private readonly onboardingService: OnboardingStatusService) {}

  @Get(':userId')
  async getStatus(@Param('userId') userId: string) {
    let status = await this.onboardingService.getByUserId(userId);
    if (!status) {
      // Crée une entrée onboarding par défaut si elle n'existe pas
      status = await this.onboardingService.updateStep(userId, 1);
    }
    return status;
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
