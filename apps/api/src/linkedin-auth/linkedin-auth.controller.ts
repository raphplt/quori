import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LinkedinAuthService } from './linkedin-auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@ApiTags('linkedin-auth')
@UseGuards(JwtAuthGuard)
@Controller('auth/linkedin')
export class LinkedinAuthController {
  constructor(
    private readonly config: ConfigService,
    private readonly service: LinkedinAuthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Redirection vers LinkedIn OAuth2' })
  redirect(@Res() res: Response) {
    const clientId = this.config.get<string>('LINKEDIN_CLIENT_ID') || '';
    const redirectUri = this.config.get<string>('LINKEDIN_REDIRECT_URI') || '';
    const scope = 'w_member_social r_liteprofile';
    const url =
      'https://www.linkedin.com/oauth/v2/authorization?response_type=code' +
      `&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scope)}`;
    res.redirect(url);
  }

  @Get('callback')
  @ApiOperation({ summary: "Callback OAuth2 LinkedIn" })
  async callback(
    @Query('code') code: string,
    @Res() res: Response,
    @Req() req: AuthenticatedRequest,
  ) {
    const clientId = this.config.get<string>('LINKEDIN_CLIENT_ID') || '';
    const clientSecret = this.config.get<string>('LINKEDIN_CLIENT_SECRET') || '';
    const redirectUri = this.config.get<string>('LINKEDIN_REDIRECT_URI') || '';
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      });
      const resp = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const data = (await resp.json()) as { access_token?: string; expires_in?: number };
      if (!data.access_token) throw new Error('no_token');
      await this.service.storeToken(req.user.id, data.access_token, data.expires_in || 0);
      const front = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      res.redirect(`${front}/settings?linkedin=success`);
    } catch {
      const front = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      res.redirect(`${front}/settings?linkedin=error`);
    }
  }
}
