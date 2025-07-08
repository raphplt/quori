import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService, GitHubProfile } from '../auth.service';
import { User } from '../../users/user.interface';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID:
        configService.get<string>('GITHUB_CLIENT_ID') || 'default-client-id',
      clientSecret:
        configService.get<string>('GITHUB_CLIENT_SECRET') ||
        'default-client-secret',
      callbackURL:
        configService.get<string>('GITHUB_CALLBACK_URL') ||
        'http://localhost:3001/api/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GitHubProfile,
  ): Promise<User> {
    return this.authService.validateGithubUser(profile, accessToken);
  }
}
