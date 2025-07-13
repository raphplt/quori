import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerateService } from '../github/services/generate.service';
import { GenerateDto, GenerateResultDto } from '../github/dto/generate.dto';
import { QuotaService } from './quota.service';

interface AuthReq {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller()
export class QuotaController {
  constructor(
    private readonly quotaService: QuotaService,
    private readonly generateService: GenerateService,
  ) {}

  @Post('generate')
  async generate(
    @Request() req: AuthReq,
    @Body() body: GenerateDto,
    @Query('installationId') installationId?: string,
    @Query('eventDeliveryId') eventDeliveryId?: string,
  ): Promise<GenerateResultDto> {
    const userId = req.user.id;
    await this.quotaService.consume(userId);
    const installation = installationId
      ? parseInt(installationId, 10)
      : undefined;
    return this.generateService.generate(
      userId,
      body,
      installation,
      eventDeliveryId,
    );
  }

  @Get('quota')
  async getQuota(@Request() req: AuthReq) {
    return this.quotaService.getUsage(req.user.id);
  }
}
