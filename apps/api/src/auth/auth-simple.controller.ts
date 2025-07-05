import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  @Get('sign-in/github')
  githubSignIn(@Res() res: Response) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email read:user repo&redirect_uri=${encodeURIComponent(baseUrl + '/auth/callback/github')}`;
    res.redirect(githubAuthUrl);
  }

  @Get('callback/github')
  githubCallback(@Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(frontendUrl);
  }
}
