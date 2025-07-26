import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { User } from '../users/user.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Initiates GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User;
    const loginResult = await this.authService.login(user);

    const redirectUrl = `${
      process.env.FRONTEND_URL || 'http://localhost:3000'
    }/auth/callback?token=${loginResult.access_token}&refreshToken=${loginResult.refresh_token}`;
    res.redirect(redirectUrl);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser() user: User) {
    return {
      user,
      message: 'Profile retrieved successfully',
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@GetUser() user: User) {
    await this.authService.logout(user.id);
    return {
      message: 'Logged out successfully',
    };
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    const { access_token, refresh_token, user } =
      await this.authService.refreshTokens(refreshToken);
    return { access_token, refresh_token, user };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@GetUser() user: User) {
    return user;
  }

  @Get('refresh-user')
  @UseGuards(JwtAuthGuard)
  async refreshUser(@GetUser() user: User) {
    // Recharger les données utilisateur depuis la base
    const refreshedUser = await this.authService.refreshUserData(user.id);
    return refreshedUser;
  }
}
