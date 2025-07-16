import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  async getTemplates(@Query('installationId') installationId?: string) {
    const id = installationId ? parseInt(installationId, 10) : undefined;
    return this.templatesService.findAvailable(id);
  }
}
