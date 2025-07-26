import { Controller, Get, Query, Req, Res, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LinkedinAuthService } from './linkedin-auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UsersService } from '../users/users.service';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@ApiTags('linkedin-auth')
@Controller('auth/linkedin')
export class LinkedinAuthController {
  constructor(
    private readonly config: ConfigService,
    private readonly service: LinkedinAuthService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Redirection vers LinkedIn OAuth2' })
  redirect(@Res() res: Response, @Query('userId') userId: string) {
    const clientId = this.config.get<string>('LINKEDIN_CLIENT_ID') || '';
    const redirectUri = this.config.get<string>('LINKEDIN_REDIRECT_URI') || '';
    const scope = 'w_member_social openid profile';
    const state = userId;
    const url =
      'https://www.linkedin.com/oauth/v2/authorization?response_type=code' +
      `&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${encodeURIComponent(state)}`;
    res.redirect(url);
  }

  @Get('callback')
  @ApiOperation({ summary: 'Callback OAuth2 LinkedIn' })
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    console.log('LinkedIn callback - userId:', state);
    const clientId = this.config.get<string>('LINKEDIN_CLIENT_ID') || '';
    const clientSecret =
      this.config.get<string>('LINKEDIN_CLIENT_SECRET') || '';
    const redirectUri = this.config.get<string>('LINKEDIN_REDIRECT_URI') || '';
    const userId = state; // Récupérer l'userId depuis le state

    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      });
      const resp = await fetch(
        'https://www.linkedin.com/oauth/v2/accessToken',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        },
      );
      const data = (await resp.json()) as {
        access_token?: string;
        expires_in?: number;
      };
      console.log('LinkedIn token response:', {
        hasToken: !!data.access_token,
        expiresIn: data.expires_in,
      });
      if (!data.access_token) throw new Error('no_token');
      await this.service.storeToken(
        userId,
        data.access_token,
        data.expires_in || 0,
      );
      console.log('Token stored in Redis for user', userId);

      // Récupérer l'id LinkedIn de l'utilisateur
      const profileResp = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const profile = await profileResp.json();
      console.log('LinkedIn profile response:', profile);

      // Essayer différents champs pour l'id LinkedIn
      const linkedInId = profile.sub || profile.id || profile.userId;
      console.log('LinkedIn ID extracted:', linkedInId);

      // Même si on n'a pas l'id LinkedIn, on sauvegarde le token
      console.log('Updating user with LinkedIn data...');
      if (linkedInId) {
        await this.usersService.updateLinkedInId(userId, linkedInId);
      }
      await this.usersService.updateLinkedInToken(userId, data.access_token);
      console.log('User updated successfully');

      const front =
        this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      res.redirect(`${front}/settings?linkedin=success`);
    } catch (error) {
      console.error('LinkedIn callback error:', error);
      const front =
        this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      res.redirect(`${front}/settings?linkedin=error`);
    }
  }

  @Post('disconnect')
  @ApiOperation({ summary: 'Déconnecter LinkedIn' })
  async disconnect(@Req() req: AuthenticatedRequest) {
    try {
      // Supprimer le token Redis
      await this.service.removeToken(req.user.id);
      // Supprimer l'id LinkedIn de l'utilisateur
      await this.usersService.updateLinkedInId(req.user.id, null);
      return { message: 'LinkedIn déconnecté avec succès' };
    } catch (error) {
      throw new Error('Erreur lors de la déconnexion LinkedIn');
    }
  }
}
