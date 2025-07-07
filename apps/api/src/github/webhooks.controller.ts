import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { GithubAppService } from './github-app.service';

@Controller('webhooks/github')
export class WebhooksController {
  constructor(private readonly appService: GithubAppService) {}

  @Post()
  async handle(
    @Req() req: Request,
    @Body() body: any,
    @Headers('x-github-delivery') delivery: string,
    @Headers('x-github-event') event: string,
  ): Promise<{ ok: boolean }> {
    this.appService.verifySignature(req);

    if (event === 'installation') {
      const action = body.action;
      const installation = body.installation;
      if (action === 'created') {
        await this.appService.upsertInstallation({
          installation_id: installation.id,
          account_login: installation.account.login,
          account_id: installation.account.id,
          repositories: body.repositories?.map((r: any) => r.full_name) || [],
        });
      } else if (action === 'deleted') {
        await this.appService.removeInstallation(installation.id);
      }
      return { ok: true };
    }

    if (event === 'installation_repositories') {
      const installationId = body.installation.id;
      const { repositories_added = [], repositories_removed = [] } = body;
      const current =
        await this.appService.getInstallationRepos(installationId);
      const added = repositories_added.map((r: any) => r.full_name);
      const removed = repositories_removed.map((r: any) => r.full_name);
      const repos = [
        ...current.filter((r: string) => !removed.includes(r)),
        ...added,
      ];
      await this.appService.updateRepos(
        installationId,
        Array.from(new Set(repos)),
      );
      return { ok: true };
    }

    if (event === 'push' || event === 'pull_request') {
      const installationId = body.installation.id;
      await this.appService.recordEvent(delivery, installationId, event, body);
      return { ok: true };
    }

    return { ok: true };
  }
}
