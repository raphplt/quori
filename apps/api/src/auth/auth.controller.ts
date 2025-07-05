import { Controller, Get, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { auth } from './auth.config';

@Controller('auth')
export class AuthController {
  private getSessionToken(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    // Utilisation d'une vérification de type plus sûre pour les cookies
    const cookies = req.cookies as Record<string, string> | undefined;
    const cookieToken = cookies?.['better-auth.session_token'];
    return authHeader?.replace('Bearer ', '') || cookieToken;
  }

  @Get('session')
  async getSession(@Req() req: Request) {
    try {
      const sessionToken = this.getSessionToken(req);

      if (!sessionToken) {
        return null;
      }

      // Créer un objet Headers pour Better Auth
      const headers = new Headers();
      headers.set('authorization', `Bearer ${sessionToken}`);

      const session = await auth.api.getSession({
        headers,
      });

      return session;
    } catch {
      return null;
    }
  }

  @Post('sign-out')
  async signOut(@Req() req: Request, @Res() res: Response) {
    try {
      const sessionToken = this.getSessionToken(req);

      if (sessionToken) {
        const headers = new Headers();
        headers.set('authorization', `Bearer ${sessionToken}`);

        await auth.api.signOut({
          headers,
        });
      }

      res.clearCookie('better-auth.session_token');
      res.status(HttpStatus.OK).json({ success: true });
    } catch {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Sign out failed',
      });
    }
  }

  @Get('sign-in/github')
  githubSignIn(@Res() res: Response) {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email read:user repo&redirect_uri=${encodeURIComponent(process.env.BASE_URL + '/auth/callback/github')}`;
    res.redirect(githubAuthUrl);
  }

  @Get('callback/github')
  githubCallback(@Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(frontendUrl);
  }
}
