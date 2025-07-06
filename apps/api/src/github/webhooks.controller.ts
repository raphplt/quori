import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { GithubAppService } from './github-app.service';

@Controller('webhooks/github')
export class WebhooksController {
  constructor(private readonly appService: GithubAppService) {}

  @Post()
  async handle(
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
    @Headers('x-github-delivery') delivery: string,
  ): Promise<{ ok: boolean }> {
    this.appService.verifySignature(req);
    await this.appService.enqueueEvent(delivery, body);
    return { ok: true };
  }
}
